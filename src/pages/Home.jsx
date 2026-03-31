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

  function pickLanguage(code) {
    try { sessionStorage.setItem('mmm_language', code); } catch {}
    navigate('/ColorScanner');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1C1C1E', fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px 40px', boxSizing: 'border-box' }}>
        <MMarkLogo />
        <div style={{ height: 24 }} />
        <h1 style={{ color: '#F5F0E8', fontSize: 34, fontWeight: 400, margin: '0 0 12px', textAlign: 'center', letterSpacing: 0.5 }}>
          MatchMyMakeup<span style={{ fontSize: 14, verticalAlign: 'super', color: '#C9A96E' }}>&trade;</span>
        </h1>
        <p style={{ color: '#C9A96E', textAlign: 'center', maxWidth: 320, lineHeight: 1.8, margin: '0 0 32px', fontSize: 11, fontFamily: "'Segoe UI', Helvetica, sans-serif", fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase' }}>
          AI Beauty Intelligence
        </p>
        <button onClick={() => pickLanguage('en')} style={{ background: '#C9A96E', color: '#1C1C1E', padding: '16px 52px', borderRadius: 0, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Segoe UI', Helvetica, sans-serif" }}>
          Start Scanning
        </button>
        <p style={{ color: '#F5F0E8', fontSize: 12, marginTop: 20, opacity: 0.4, fontFamily: "'Segoe UI', Helvetica, sans-serif" }}>No account needed · Free to use</p>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🌍</div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: '#F5F0E8', fontFamily: "Georgia, 'Times New Roman', serif" }}>Choose your consultant</h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(201,169,110,0.7)', fontSize: 12, fontFamily: "'Segoe UI', Helvetica, sans-serif" }}>Tap to select your language and start</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
      </div>
    </div>
  );
}
