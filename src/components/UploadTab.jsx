import { useState, useRef, useEffect } from "react";

export default function UploadTab({ onColorPicked, t }) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [pin, setPin] = useState(null);
  const [imgEl, setImgEl] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!imgEl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imgEl, 0, 0, canvas.width / zoom, canvas.height / zoom);
    ctx.restore();
  }, [zoom, offset, imgEl]);

  function loadFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        const maxW = parent ? parent.offsetWidth - 32 : 320;
        const scale = Math.min(maxW / img.width, 360 / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        setImgEl(img);
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

  function pickColor(clientX, clientY) {
    const canvas = canvasRef.current;
    if (!canvas || !imgEl) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    const imgX = Math.floor((canvasX - offset.x) / zoom);
    const imgY = Math.floor((canvasY - offset.y) / zoom);

    const tmp = document.createElement('canvas');
    tmp.width = imgEl.naturalWidth || imgEl.width;
    tmp.height = imgEl.naturalHeight || imgEl.height;
    tmp.getContext('2d').drawImage(imgEl, 0, 0);
    const px = tmp.getContext('2d').getImageData(
      Math.max(0, Math.min(tmp.width - 1, imgX)),
      Math.max(0, Math.min(tmp.height - 1, imgY)),
      1, 1
    ).data;

    const r = px[0], g = px[1], b = px[2];
    const hex = '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
    setPin({ cx: clientX - rect.left, cy: clientY - rect.top });
    onColorPicked({ r, g, b, hex });
  }

  function handleMouseDown(e) {
    isDragging.current = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  }

  function handleMouseMove(e) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging.current = true;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  }

  function handleMouseUp(e) {
    if (!isDragging.current) pickColor(e.clientX, e.clientY);
    dragStart.current = null;
  }

  function handleTouch(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (touch) pickColor(touch.clientX, touch.clientY);
  }

  function reset() {
    setUploadedImage(false); setPin(null); setImgEl(null);
    setZoom(1); setOffset({ x: 0, y: 0 });
    onColorPicked(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={e=>loadFile(e.target.files[0])} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={e=>loadFile(e.target.files[0])} />

      {!uploadedImage ? (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Take photo - primary CTA */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            style={{padding:'18px',border:'none',borderRadius:16,cursor:'pointer',background:'linear-gradient(135deg,#9d174d,#7c3aed)',color:'white',fontSize:16,fontWeight:800,boxShadow:'0 6px 20px rgba(124,58,237,0.35)'}}
          >
            📸 Take a Photo Now
          </button>

          {/* Upload from gallery - secondary */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{border:'2px dashed #C2185B',borderRadius:14,padding:'20px',textAlign:'center',cursor:'pointer',background:'#fdf2f8'}}
          >
            <div style={{fontSize:32}}>🖼️</div>
            <div style={{color:'#9d174d',fontWeight:700,marginTop:8,fontSize:14}}>Upload from Gallery</div>
            <div style={{color:'#aaa',fontSize:12,marginTop:4}}>JPG · PNG · WEBP</div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{position:'relative',borderRadius:12,overflow:'hidden',background:'#f0f0f0',cursor:'crosshair'}}>
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchEnd={handleTouch}
              style={{width:'100%',display:'block',touchAction:'none',userSelect:'none'}}
            />
            {pin && (
              <div style={{position:'absolute',left:pin.cx-11,top:pin.cy-11,width:22,height:22,borderRadius:'50%',border:'3px solid white',boxShadow:'0 0 0 2px rgba(0,0,0,0.7)',pointerEvents:'none'}} />
            )}
          </div>

          {/* Zoom controls */}
          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10,justifyContent:'center'}}>
            <button onClick={()=>setZoom(z=>Math.max(0.5,+(z-0.25).toFixed(2)))} style={{width:34,height:34,borderRadius:'50%',border:'1px solid #e5e7eb',background:'white',fontSize:18,cursor:'pointer',fontWeight:700,lineHeight:1}}>−</button>
            <span style={{fontSize:12,color:'#888',minWidth:55,textAlign:'center'}}>{Math.round(zoom*100)}%</span>
            <button onClick={()=>setZoom(z=>Math.min(4,+(z+0.25).toFixed(2)))} style={{width:34,height:34,borderRadius:'50%',border:'1px solid #e5e7eb',background:'white',fontSize:18,cursor:'pointer',fontWeight:700,lineHeight:1}}>+</button>
            <button onClick={()=>{setZoom(1);setOffset({x:0,y:0});}} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #e5e7eb',background:'white',fontSize:11,cursor:'pointer',color:'#666'}}>Reset</button>
          </div>

          <p style={{textAlign:'center',fontSize:12,color:'#999',marginTop:6}}>
            👆 Tap any point to pick color · Drag to pan · +/− to zoom
          </p>
          <button onClick={reset} style={{display:'block',margin:'8px auto 0',background:'none',border:'1px solid #ddd',borderRadius:20,padding:'5px 16px',cursor:'pointer',fontSize:13,color:'#666'}}>
            ↩ Change image
          </button>
        </div>
      )}
    </div>
  );
}
