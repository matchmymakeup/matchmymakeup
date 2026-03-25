import { useState, useRef, useEffect } from "react";

// ── Upload Tab with camera capture + pan/zoom ─────────────────────────────────
export default function UploadTab({ onColorPicked, t }) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [pin, setPin] = useState(null);
  const [imgData, setImgData] = useState(null); // original image
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  // Redraw canvas whenever zoom/offset changes
  useEffect(() => {
    if (!imgData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imgData, 0, 0, canvas.width / zoom, canvas.height / zoom);
    ctx.restore();
  }, [zoom, offset, imgData]);

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      const img = new Image();
      img.onload = function () {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const maxW = canvas.parentElement ? (canvas.parentElement.offsetWidth || 340) : 340;
        const scale = Math.min(maxW / img.width, 360 / img.height, 1);
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        setImgData(img);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setUploadedImage(true);
        setPin(null);
        onColorPicked(null);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) loadImage(file);
  }

  function getCanvasPoint(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      cx: (e.clientX - rect.left),
      cy: (e.clientY - rect.top),
      x: Math.floor(((e.clientX - rect.left) * scaleX - offset.x) / zoom),
      y: Math.floor(((e.clientY - rect.top) * scaleY - offset.y) / zoom),
    };
  }

  function handleCanvasClick(e) {
    if (dragging) return;
    const canvas = canvasRef.current;
    if (!canvas || !imgData) return;
    const { cx, cy, x, y } = getCanvasPoint(e);

    // Sample the pixel from a temporary canvas at original resolution
    const tmp = document.createElement('canvas');
    tmp.width = imgData.naturalWidth || imgData.width;
    tmp.height = imgData.naturalHeight || imgData.height;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(imgData, 0, 0);
    const px = Math.max(0, Math.min(tmp.width - 1, x));
    const py = Math.max(0, Math.min(tmp.height - 1, y));
    const pixel = tctx.getImageData(px, py, 1, 1).data;

    const r = pixel[0], g = pixel[1], b = pixel[2];
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    setPin({ cx, cy });
    onColorPicked({ r, g, b, hex });
  }

  function handleCanvasTouch(e) {
    e.preventDefault();
    const touch = e.changedTouches && e.changedTouches[0];
    if (touch) handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY });
  }

  // Drag to pan
  function handleMouseDown(e) {
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    setDragging(false);
  }

  function handleMouseMove(e) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx - offset.x) > 3 || Math.abs(dy - offset.y) > 3) setDragging(true);
    setOffset({ x: dx, y: dy });
  }

  function handleMouseUp(e) {
    if (!dragging) handleCanvasClick(e);
    dragStart.current = null;
    setTimeout(() => setDragging(false), 50);
  }

  function reset() {
    setUploadedImage(false);
    setPin(null);
    setImgData(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    onColorPicked(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  return (
    <div>
      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

      {!uploadedImage ? (
        <div>
          {/* Take photo button — prominent on mobile */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            style={{ display: 'block', width: '100%', padding: '18px', marginBottom: 12, border: 'none', borderRadius: 16, cursor: 'pointer', background: 'linear-gradient(135deg,#9d174d,#7c3aed)', color: 'white', fontSize: 15, fontWeight: 700 }}
          >
            📸 Take a Photo Now
          </button>

          {/* Upload from gallery */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ border: '2px dashed #C2185B', borderRadius: 14, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: '#fdf2f8' }}
          >
            <div style={{ fontSize: 32 }}>🖼️</div>
            <div style={{ color: '#9d174d', fontWeight: 700, marginTop: 8, fontSize: 14 }}>
              {t.choosePhoto || 'Choose from Gallery'}
            </div>
            <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{t.uploadFormats}</div>
            <div style={{ color: '#bbb', fontSize: 11, marginTop: 8, lineHeight: 1.6 }}>
              Upload any photo — outfit, flower,<br />packaging, anything you want to match
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Canvas */}
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'crosshair', userSelect: 'none' }}>
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchEnd={handleCanvasTouch}
              style={{ width: '100%', display: 'block', touchAction: 'none' }}
            />
            {pin && (
              <div style={{ position: 'absolute', left: pin.cx - 11, top: pin.cy - 11, width: 22, height: 22, borderRadius: '50%', border: '3px solid white', boxShadow: '0 0 0 2px rgba(0,0,0,0.7)', pointerEvents: 'none' }} />
            )}
          </div>

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, justifyContent: 'center' }}>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}>−</button>
            <span style={{ fontSize: 12, color: '#888', minWidth: 50, textAlign: 'center' }}>{Math.round(zoom * 100)}% zoom</span>
            <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}>+</button>
            <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', fontSize: 11, cursor: 'pointer', color: '#666' }}>Reset</button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 6 }}>
            👆 Tap any point to pick its color · Drag to pan · +/− to zoom
          </p>
          <button onClick={reset} style={{ display: 'block', margin: '8px auto', background: 'none', border: '1px solid #ddd', borderRadius: 20, padding: '4px 16px', cursor: 'pointer', fontSize: 13, color: '#666' }}>
            {t.changeImage || '↩ Change image'}
          </button>
        </div>
      )}
    </div>
  );
}
