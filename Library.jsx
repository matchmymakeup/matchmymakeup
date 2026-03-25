import { useState, useEffect, useRef } from "react";

const LIBRARY_KEY = 'mmm_library';
const MAX_IMAGES = 3;

const IMAGE_SLOTS = [
  { id: 'face', label: 'Face', emoji: '🙂', hint: 'For lip & blush try-on' },
  { id: 'lips', label: 'Lips', emoji: '💋', hint: 'For lipstick close-ups' },
  { id: 'hands', label: 'Hands', emoji: '💅', hint: 'For nail polish try-on' },
];

function getLibrary() {
  try { return JSON.parse(localStorage.getItem(LIBRARY_KEY) || '{"scans":[],"images":{}}'); }
  catch { return { scans: [], images: {} }; }
}

function saveLibrary(lib) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
}

export default function LibraryPage() {
  const [library, setLibrary] = useState(getLibrary());
  const [activeTab, setActiveTab] = useState('scans');
  const fileRefs = { face: useRef(), lips: useRef(), hands: useRef() };

  useEffect(() => { setLibrary(getLibrary()); }, []);

  function handleImageUpload(slotId, e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const lib = getLibrary();
      lib.images = lib.images || {};
      lib.images[slotId] = { dataUrl: ev.target.result, name: file.name, date: new Date().toISOString() };
      saveLibrary(lib);
      setLibrary({ ...lib });
    };
    reader.readAsDataURL(file);
  }

  function removeImage(slotId) {
    const lib = getLibrary();
    delete lib.images[slotId];
    saveLibrary(lib);
    setLibrary({ ...lib });
  }

  function removeScan(index) {
    const lib = getLibrary();
    lib.scans.splice(index, 1);
    saveLibrary(lib);
    setLibrary({ ...lib });
  }

  const scans = library.scans || [];
  const images = library.images || {};

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fdf2f8,#f3e8ff,#fce7f3)', fontFamily: "'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => window.location.href = '/ColorScanner'} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#666', fontWeight: 600 }}>
            ← Scanner
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>💄</span>
            <span style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg,#9d174d,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Library</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 60px' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 16, padding: 4, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          {[['scans', '🎨 Scan History'], ['images', '📷 My Photos']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: '10px 4px', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === id ? 'linear-gradient(135deg,#9d174d,#7c3aed)' : 'transparent', color: activeTab === id ? 'white' : '#666' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Scan History Tab */}
        {activeTab === 'scans' && (
          <div>
            {scans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
                <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No scans yet</p>
                <p style={{ fontSize: 13 }}>Your scan history will appear here</p>
                <button onClick={() => window.location.href = '/ColorScanner'} style={{ marginTop: 20, background: 'linear-gradient(135deg,#9d174d,#7c3aed)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Start Scanning
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {scans.slice().reverse().map((scan, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: scan.color?.hex, flexShrink: 0, boxShadow: `0 4px 12px ${scan.color?.hex}60` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 16, color: '#111' }}>{scan.color?.hex}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                        {scan.skinTone && <span style={{ background: '#fdf2f8', color: '#9d174d', borderRadius: 20, padding: '2px 8px', fontSize: 11, marginRight: 4 }}>{scan.skinTone}</span>}
                        {scan.occasion && <span style={{ background: '#f3e8ff', color: '#7c3aed', borderRadius: 20, padding: '2px 8px', fontSize: 11, marginRight: 4 }}>{scan.occasion}</span>}
                        {scan.country && <span style={{ background: '#ecfdf5', color: '#065f46', borderRadius: 20, padding: '2px 8px', fontSize: 11 }}>{scan.country}</span>}
                      </div>
                      {scan.advice && <p style={{ fontSize: 12, color: '#666', marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{scan.advice}</p>}
                      <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{new Date(scan.date).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => removeScan(scans.length - 1 - i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ddd', padding: 4, flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Photos Tab */}
        {activeTab === 'images' && (
          <div>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16, textAlign: 'center' }}>
              Save up to 3 reference photos for virtual try-on
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {IMAGE_SLOTS.map(slot => {
                const saved = images[slot.id];
                return (
                  <div key={slot.id} style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 24 }}>{slot.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111' }}>{slot.label} Photo</div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>{slot.hint}</div>
                      </div>
                    </div>

                    {saved ? (
                      <div style={{ position: 'relative' }}>
                        <img src={saved.dataUrl} alt={slot.label} style={{ width: '100%', borderRadius: 14, maxHeight: 200, objectFit: 'cover' }} />
                        <button onClick={() => removeImage(slot.id)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 6, textAlign: 'center' }}>Saved {new Date(saved.date).toLocaleDateString()}</div>
                      </div>
                    ) : (
                      <div onClick={() => fileRefs[slot.id].current?.click()} style={{ border: '2px dashed #e5e7eb', borderRadius: 14, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                        <div style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>Tap to upload {slot.label.toLowerCase()} photo</div>
                        <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>JPG · PNG · WEBP</div>
                      </div>
                    )}
                    <input ref={fileRefs[slot.id]} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(slot.id, e)} />
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20, background: 'linear-gradient(135deg,#fdf2f8,#f3e8ff)', border: '1px solid #f9a8d4', borderRadius: 16, padding: 16, fontSize: 12, color: '#9d174d', lineHeight: 1.6 }}>
              🔒 Your photos are stored privately on your device only and never uploaded to our servers. See our <a href="/terms" style={{ color: '#7c3aed' }}>Terms & Conditions</a> for our full data policy.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
