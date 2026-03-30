import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LANGUAGES = [
  { id: 'en', flag: '\u{1F1FA}\u{1F1F8}', lang: 'English', persona: 'Maya', country: 'USA' },
  { id: 'hi', flag: '\u{1F1EE}\u{1F1F3}', lang: 'Hindi', persona: 'Priya', country: 'India' },
  { id: 'pt', flag: '\u{1F1E7}\u{1F1F7}', lang: 'Portuguese', persona: 'Valentina', country: 'Brazil' },
  { id: 'zh', flag: '\u{1F1E8}\u{1F1F3}', lang: 'Mandarin', persona: 'Mei', country: 'China' },
  { id: 'id', flag: '\u{1F1EE}\u{1F1E9}', lang: 'Bahasa Indonesia', persona: 'Sari', country: 'Indonesia' },
  { id: 'ng', flag: '\u{1F1F3}\u{1F1EC}', lang: 'Nigerian Pidgin', persona: 'Adaeze', country: 'Nigeria' },
]

const TAGLINES = {
  en: 'Scan any color. Find your perfect makeup match.',
  hi: '\u0915\u094B\u0908 \u092D\u0940 \u0930\u0902\u0917 \u0938\u094D\u0915\u0948\u0928 \u0915\u0930\u0947\u0902\u0964 \u0905\u092A\u0928\u093E \u092A\u0930\u092B\u0947\u0915\u094D\u091F \u0936\u0947\u0921 \u0916\u094B\u091C\u0947\u0902\u0964',
  pt: 'Escaneie qualquer cor. Encontre seu tom perfeito.',
  zh: '\u626B\u63CF\u4EFB\u4F55\u989C\u8272\u3002\u627E\u5230\u4F60\u7684\u5B8C\u7F8E\u5339\u914D\u3002',
  id: 'Pindai warna apa saja. Temukan shade sempurnamu.',
  ng: 'Scan any colour. Find your perfect match!',
}

const BTN_LABELS = {
  en: 'Start Scanning',
  hi: '\u0938\u094D\u0915\u0948\u0928\u093F\u0902\u0917 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902',
  pt: 'Iniciar',
  zh: '\u5F00\u59CB\u626B\u63CF',
  id: 'Mulai Pindai',
  ng: 'Start Scanning',
}

export default function Home() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  function handleStart() {
    const lang = selected || LANGUAGES[0]
    sessionStorage.setItem('mmm_lang', lang.id)
    sessionStorage.setItem('mmm_country', lang.country)
    navigate('/ColorScanner')
  }

  const activeLang = selected?.id || 'en'

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#fdf2f8 0%,#f3e8ff 40%,#fce7f3 100%)',fontFamily:"'Segoe UI',sans-serif",display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 16px',textAlign:'center'}}>
      <div style={{maxWidth:460,width:'100%'}}>

        {/* Branding */}
        <div style={{fontSize:64,marginBottom:12,filter:'drop-shadow(0 4px 12px rgba(157,23,77,0.2))'}}>
          {'\uD83D\uDC84'}
        </div>
        <h1 style={{margin:'0 0 8px',fontSize:38,fontWeight:900,background:'linear-gradient(135deg,#9d174d,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.1}}>
          MatchMyMakeup
        </h1>
        <p style={{color:'#9d174d',fontSize:16,margin:'0 auto 32px',maxWidth:340,lineHeight:1.6,opacity:0.85}}>
          {TAGLINES[activeLang]}
        </p>

        {/* Language selector */}
        <div style={{background:'white',borderRadius:24,padding:'20px 16px',boxShadow:'0 8px 40px rgba(124,58,237,0.10)',marginBottom:28}}>
          <p style={{fontSize:12,color:'#999',fontWeight:600,textTransform:'uppercase',letterSpacing:1.5,margin:'0 0 14px'}}>
            Choose your beauty consultant
          </p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {LANGUAGES.map(lang => {
              const active = selected?.id === lang.id
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelected(lang)}
                  style={{
                    display:'flex',alignItems:'center',gap:10,
                    padding:'12px',borderRadius:14,cursor:'pointer',
                    border: active ? '2px solid #7c3aed' : '2px solid #f3ecf9',
                    background: active ? 'linear-gradient(135deg,#faf5ff,#fdf2f8)' : '#fafafa',
                    boxShadow: active ? '0 4px 16px rgba(124,58,237,0.12)' : 'none',
                    transition:'all 0.15s ease',textAlign:'left',
                  }}
                >
                  <span style={{fontSize:24,lineHeight:1}}>{lang.flag}</span>
                  <span style={{flex:1,minWidth:0}}>
                    <span style={{display:'block',fontSize:13,fontWeight:700,color: active ? '#7c3aed' : '#333'}}>{lang.lang}</span>
                    <span style={{display:'block',fontSize:11,color: active ? '#9d174d' : '#aaa',marginTop:1}}>{lang.persona} · {lang.country}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={handleStart}
          style={{
            display:'block',width:'100%',maxWidth:360,margin:'0 auto 40px',padding:'18px 32px',
            fontSize:19,fontWeight:800,border:'none',borderRadius:22,cursor:'pointer',
            background:'linear-gradient(135deg,#9d174d,#7c3aed)',color:'white',
            boxShadow:'0 8px 32px rgba(124,58,237,0.35)',
          }}
        >
          {BTN_LABELS[activeLang]} {'\u2192'}
        </button>

        {/* How it works */}
        <div style={{display:'flex',gap:20,justifyContent:'center',marginBottom:40,flexWrap:'wrap'}}>
          {[['\uD83D\uDCF7','Upload a photo'],['\uD83C\uDFA8','Pick a color'],['\uD83D\uDC84','Find your match']].map(([icon,label],i)=>(
            <div key={i} style={{textAlign:'center',minWidth:80}}>
              <div style={{fontSize:32,marginBottom:6}}>{icon}</div>
              <div style={{fontSize:12,color:'#888',fontWeight:500}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Markets */}
        <p style={{fontSize:12,color:'#ccc',marginBottom:6}}>Available in 6 markets</p>
        <p style={{fontSize:18,color:'#666',marginBottom:24,letterSpacing:4}}>
          {LANGUAGES.map(l => l.flag).join(' ')}
        </p>

        {/* Terms */}
        <p style={{fontSize:11,color:'#ccc'}}>
          By using this app you agree to our{' '}
          <span onClick={() => navigate('/Terms')} style={{color:'#9d174d',cursor:'pointer',textDecoration:'underline'}}>
            Terms & Conditions
          </span>
          {' '}including anonymous data collection for market research.
        </p>
      </div>
    </div>
  )
}
