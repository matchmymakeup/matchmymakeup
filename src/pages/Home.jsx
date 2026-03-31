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
        <h1 style={{ color: '#7B2D8B', fontSize: 34, fontWeight: 900, margin: '0 0 12px', textAlign: 'center' }}>MatchMyMakeup<span style={{ fontSize: 14, verticalAlign: 'super' }}>&trade;</span></h1>
        <p style={{ color: '#C2185B', textAlign: 'center', maxWidth: 320, lineHeight: 1.6, margin: '0 0 40px', fontSize: 15 }}>
          Scan any color and instantly find your perfect makeup match — powered by AI.
        </p>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #7B2D8B, #C2185B)', color: 'white', padding: '18px 48px', borderRadius: 30, fontSize: 18, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(123,45,139,0.4)', letterSpacing: 0.3 }}>
          Start Scanning →
        </button>
        <p style={{ color: '#aaa', fontSize: 13, marginTop: 14 }}>No account needed · Free to use</p>
      </div>
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '20px 16px', width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 12px', flexShrink: 0 }} />
            <div style={{ textAlign: 'center', marginBottom: 12, flexShrink: 0 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🌍</div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>Choose your language</h2>
              <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>Tap to select and continue</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['en','🌍','English','Maya · Global'],
                ['hi','🇮🇳','हिन्दी','Priya · India'],
                ['pt','🇧🇷','Português','Valentina · Brazil'],
                ['zh','🇨🇳','中文','Mei (美) · China'],
                ['id','🇮🇩','Bahasa Indonesia','Sari · Indonesia'],
                ['ng','🇳🇬','English (NG)','Adaeze · Nigeria'],
                ['es','🇲🇽','Español','Isabella · Latin America'],
                ['ar','🇸🇦','العربية','Layla · Middle East'],
                ['fr','🇫🇷','Français','Céline · France/West Africa'],
                ['bn','🇧🇩','বাংলা','Ananya · Bangladesh'],
                ['sw','🇰🇪','Kiswahili','Amara · East Africa'],
              ].map(([code, flag, name, sub]) => (
                <button key={code} onClick={() => pickLanguage(code)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#1a1a1a', textAlign: 'left', minHeight: 44, flexShrink: 0 }}>
                  <span style={{ fontSize: 22 }}>{flag}</span>
                  <div><div style={{ fontWeight: 700 }}>{name}</div><div style={{ fontSize: 12, color: '#888' }}>{sub}</div></div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(false)} style={{ marginTop: 12, width: '100%', padding: '12px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', color: '#999', fontSize: 13, flexShrink: 0, minHeight: 44 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
