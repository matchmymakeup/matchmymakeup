import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MMarkLogo() {
  return (
    <svg width="64" height="56" viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="4,52 18,12 32,36 46,12 60,52" stroke="#C9A96E" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="8" r="5" fill="#B76E79" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  function pickLanguage(code) {
    try { sessionStorage.setItem('mmm_language', code); } catch {}
    navigate('/ColorScanner');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1C1C1E', fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px', boxSizing: 'border-box' }}>
        <MMarkLogo />
        <div style={{ height: 24 }} />
        <h1 style={{ color: '#F5F0E8', fontSize: 34, fontWeight: 400, margin: '0 0 12px', textAlign: 'center', letterSpacing: 0.5 }}>
          MatchMyMakeup<span style={{ fontSize: 14, verticalAlign: 'super', color: '#C9A96E' }}>&trade;</span>
        </h1>
        <p style={{ color: '#C9A96E', textAlign: 'center', maxWidth: 320, lineHeight: 1.8, margin: '0 0 48px', fontSize: 11, fontFamily: "'Segoe UI', Helvetica, sans-serif", fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase' }}>
          AI Beauty Intelligence
        </p>
        <button onClick={() => setShowModal(true)} style={{ background: '#C9A96E', color: '#1C1C1E', padding: '16px 52px', borderRadius: 0, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Segoe UI', Helvetica, sans-serif" }}>
          Start Scanning
        </button>
        <p style={{ color: '#F5F0E8', fontSize: 12, marginTop: 20, opacity: 0.4, fontFamily: "'Segoe UI', Helvetica, sans-serif" }}>No account needed · Free to use</p>
      </div>
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#2C2C2E', borderRadius: '24px 24px 0 0', padding: '20px 16px', width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ width: 40, height: 4, background: '#555', borderRadius: 2, margin: '0 auto 12px', flexShrink: 0 }} />
            <div style={{ textAlign: 'center', marginBottom: 12, flexShrink: 0 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🌍</div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: '#F5F0E8', fontFamily: "Georgia, 'Times New Roman', serif" }}>Choose your consultant</h2>
              <p style={{ margin: '4px 0 0', color: '#888', fontSize: 12, fontFamily: "'Segoe UI', Helvetica, sans-serif" }}>Tap to select and continue</p>
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
                <button key={code} onClick={() => pickLanguage(code)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, border: '1px solid #444', background: '#2C2C2E', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#F5F0E8', textAlign: 'left', minHeight: 44, flexShrink: 0, fontFamily: "'Segoe UI', Helvetica, sans-serif" }}>
                  <span style={{ fontSize: 22 }}>{flag}</span>
                  <div><div style={{ fontWeight: 700, color: '#F5F0E8' }}>{name}</div><div style={{ fontSize: 12, color: '#C9A96E' }}>{sub}</div></div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(false)} style={{ marginTop: 12, width: '100%', padding: '12px', background: 'none', border: '1px solid #444', borderRadius: 12, cursor: 'pointer', color: '#888', fontSize: 13, flexShrink: 0, minHeight: 44, fontFamily: "'Segoe UI', Helvetica, sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
