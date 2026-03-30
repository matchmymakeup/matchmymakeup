import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LANGUAGES = [
  { id: 'en', flag: '\u{1F1FA}\u{1F1F8}', lang: 'English', persona: 'Maya', country: 'USA' },
  { id: 'hi', flag: '\u{1F1EE}\u{1F1F3}', lang: 'Hindi', persona: 'Priya', country: 'India' },
  { id: 'pt', flag: '\u{1F1E7}\u{1F1F7}', lang: 'Portuguese', persona: 'Valentina', country: 'Brazil' },
  { id: 'zh', flag: '\u{1F1E8}\u{1F1F3}', lang: 'Mandarin', persona: 'Mei', country: 'China' },
  { id: 'id', flag: '\u{1F1EE}\u{1F1E9}', lang: 'Bahasa Indonesia', persona: 'Sari', country: 'Indonesia' },
  { id: 'ng', flag: '\u{1F1F3}\u{1F1EC}', lang: 'English NG', persona: 'Adaeze', country: 'Nigeria' },
]

export default function Home() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  function handleSelectLang(lang) {
    sessionStorage.setItem('mmm_lang', lang.id)
    sessionStorage.setItem('mmm_country', lang.country)
    navigate('/ColorScanner')
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#fdf2f8 0%,#f3e8ff 40%,#fce7f3 100%)',fontFamily:"'Segoe UI',sans-serif",display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 16px',textAlign:'center'}}>
      <div style={{maxWidth:460,width:'100%'}}>

        <div style={{fontSize:72,marginBottom:16,filter:'drop-shadow(0 4px 12px rgba(157,23,77,0.2))'}}>
          {'\uD83D\uDC84'}
        </div>
        <h1 style={{margin:'0 0 12px',fontSize:40,fontWeight:900,background:'linear-gradient(135deg,#9d174d,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.1}}>
          MatchMyMakeup
        </h1>
        <p style={{color:'#9d174d',fontSize:16,margin:'0 auto 40px',maxWidth:360,lineHeight:1.7,opacity:0.85}}>
          Scan any color and find your perfect makeup match — powered by AI
        </p>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            display:'block',width:'100%',maxWidth:360,margin:'0 auto 48px',padding:'20px 32px',
            fontSize:20,fontWeight:800,border:'none',borderRadius:24,cursor:'pointer',
            background:'linear-gradient(135deg,#9d174d,#7c3aed)',color:'white',
            boxShadow:'0 8px 32px rgba(124,58,237,0.4)',
          }}
        >
          Start Scanning {'\u2192'}
        </button>

        <div style={{display:'flex',gap:24,justifyContent:'center',marginBottom:48,flexWrap:'wrap'}}>
          {[['\uD83D\uDCF7','Upload a photo'],['\uD83C\uDFA8','Pick a color'],['\uD83D\uDC84','Find your match']].map(([icon,label],i)=>(
            <div key={i} style={{textAlign:'center',minWidth:80}}>
              <div style={{fontSize:36,marginBottom:8}}>{icon}</div>
              <div style={{fontSize:13,color:'#888',fontWeight:500}}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{fontSize:13,color:'#bbb',marginBottom:8}}>Available in 6 markets</p>
        <p style={{fontSize:18,color:'#666',marginBottom:32,letterSpacing:4}}>
          {LANGUAGES.map(l => l.flag).join(' ')}
        </p>

        <p style={{fontSize:12,color:'#ccc'}}>
          By using this app you agree to our{' '}
          <span onClick={() => navigate('/Terms')} style={{color:'#9d174d',cursor:'pointer',textDecoration:'underline'}}>
            Terms & Conditions
          </span>
          {' '}including anonymous data collection for market research.
        </p>
      </div>

      {/* Language selector modal overlay */}
      {showModal && (
        <div style={{position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={() => setShowModal(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'}} />
          <div style={{position:'relative',background:'white',borderRadius:28,padding:'28px 20px 24px',maxWidth:420,width:'100%',boxShadow:'0 24px 80px rgba(124,58,237,0.25)',animation:'modalSlideIn 0.25s ease-out'}}>
            <button type="button" onClick={() => setShowModal(false)} style={{position:'absolute',top:14,right:16,background:'none',border:'none',fontSize:20,color:'#bbb',cursor:'pointer',padding:4}}>
              {'\u2715'}
            </button>
            <div style={{fontSize:40,marginBottom:6}}>{'\uD83D\uDC84'}</div>
            <h2 style={{margin:'0 0 4px',fontSize:22,fontWeight:900,background:'linear-gradient(135deg,#9d174d,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
              Choose Your Consultant
            </h2>
            <p style={{color:'#999',fontSize:12,margin:'0 0 20px'}}>
              Select your language & beauty advisor
            </p>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleSelectLang(lang)}
                  style={{
                    display:'flex',alignItems:'center',gap:10,padding:'14px 12px',
                    borderRadius:16,cursor:'pointer',border:'2px solid #f3ecf9',
                    background:'white',textAlign:'left',transition:'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.border = '2px solid #7c3aed'; e.currentTarget.style.background = 'linear-gradient(135deg,#faf5ff,#fdf2f8)' }}
                  onMouseLeave={e => { e.currentTarget.style.border = '2px solid #f3ecf9'; e.currentTarget.style.background = 'white' }}
                >
                  <span style={{fontSize:28,lineHeight:1}}>{lang.flag}</span>
                  <span style={{flex:1,minWidth:0}}>
                    <span style={{display:'block',fontSize:13,fontWeight:700,color:'#333'}}>{lang.lang}</span>
                    <span style={{display:'block',fontSize:11,color:'#999',marginTop:2}}>{lang.persona} · {lang.country}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.93) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
