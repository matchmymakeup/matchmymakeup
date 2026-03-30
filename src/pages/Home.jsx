import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  function pickLanguage(code) {
    try { sessionStorage.setItem('mmm_language', code); } catch {}
    navigate('/ColorScanner');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f0ff 0%, #ffe0f0 100%)', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 16 }}>💄</div>
        <h1 style={{ color: '#7B2D8B', fontSize: 34, fontWeight: 900, margin: '0 0 12px', textAlign: 'center' }}>MatchMyMakeup</h1>
        <p style={{ color: '#C2185B', textAlign: 'center', maxWidth: 320, lineHeight: 1.6, margin: '0 0 40px', fontSize: 15 }}>
          Scan any color and instantly find your perfect makeup match — powered by AI.
        </p>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #7B2D8B, #C2185B)', color: 'white', padding: '18px 48px', borderRadius: 30, fontSize: 18, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(123,45,139,0.4)', letterSpacing: 0.3 }}>
          Start Scanning →
        </button>
        <p style={{ color: '#aaa', fontSize: 13, marginTop: 14 }}>No account needed · Free to use</p>
      </div>
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 28, padding: '32px 28px', width: '100%', maxWidth: 400, boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🌍</div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>Choose your language</h2>
              <p style={{ margin: '6px 0 0', color: '#888', fontSize: 13 }}>Tap to select and continue</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => pickLanguage('en')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#1a1a1a', textAlign: 'left' }}>
                <span style={{ fontSize: 28 }}>🇺🇸</span>
                <div><div style={{ fontWeight: 700 }}>English</div><div style={{ fontSize: 12, color: '#888' }}>Maya · USA</div></div>
              </button>
              <button onClick={() => pickLanguage('hi')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#1a1a1a', textAlign: 'left' }}>
                <span style={{ fontSize: 28 }}>🇮🇳</span>
                <div><div style={{ fontWeight: 700 }}>हिन्दी</div><div style={{ fontSize: 12, color: '#888' }}>Priya · India</div></div>
              </button>
              <button onClick={() => pickLanguage('pt')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#1a1a1a', textAlign: 'left' }}>
                <span style={{ fontSize: 28 }}>🇧🇷</span>
                <div><div style={{ fontWeight: 700 }}>Português</div><div style={{ fontSize: 12, color: '#888' }}>Valentina · Brazil</div></div>
              </button>
              <button onClick={() => pickLanguage('zh')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#1a1a1a', textAlign: 'left' }}>
                <span style={{ fontSize: 28 }}>🇨🇳</span>
                <div><div style={{ fontWeight: 700 }}>中文</div><div style={{ fontSize: 12, color: '#888' }}>Mei (美) · China</div></div>
              </button>
              <button onClick={() => pickLanguage('id')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#1a1a1a', textAlign: 'left' }}>
                <span style={{ fontSize: 28 }}>🇮🇩</span>
                <div><div style={{ fontWeight: 700 }}>Bahasa Indonesia</div><div style={{ fontSize: 12, color: '#888' }}>Sari · Indonesia</div></div>
              </button>
              <button onClick={() => pickLanguage('ng')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#1a1a1a', textAlign: 'left' }}>
                <span style={{ fontSize: 28 }}>🇳🇬</span>
                <div><div style={{ fontWeight: 700 }}>English (NG)</div><div style={{ fontSize: 12, color: '#888' }}>Adaeze · Nigeria</div></div>
              </button>
            </div>
            <button onClick={() => setShowModal(false)} style={{ marginTop: 20, width: '100%', padding: '12px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', color: '#999', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
