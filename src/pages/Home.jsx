import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff,#fce7f3)",fontFamily:"'Segoe UI',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px",textAlign:"center"}}>
      <div style={{maxWidth:480,width:"100%"}}>
        <div style={{fontSize:72,marginBottom:16}}>💄</div>
        <h1 style={{margin:"0 0 12px",fontSize:42,fontWeight:900,background:"linear-gradient(135deg,#9d174d,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>MatchMyMakeup</h1>
        <p style={{color:"#9d174d",fontSize:17,marginBottom:40,maxWidth:360,margin:"0 auto 40px",lineHeight:1.6,opacity:0.85}}>
          Scan any color and find your perfect makeup match from brands around the world.
        </p>

        <button
          onClick={() => navigate('/ColorScanner')}
          style={{display:"block",width:"100%",maxWidth:360,margin:"0 auto 48px",padding:"20px 32px",fontSize:20,fontWeight:800,border:"none",borderRadius:24,cursor:"pointer",background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",boxShadow:"0 8px 32px rgba(124,58,237,0.4)"}}
        >
          Start Scanning →
        </button>

        <div style={{display:"flex",gap:24,justifyContent:"center",marginBottom:48,flexWrap:"wrap"}}>
          {[["📷","Upload a photo"],["🎨","Pick a color"],["💄","Find your match"]].map(([icon,label],i)=>(
            <div key={i} style={{textAlign:"center",minWidth:80}}>
              <div style={{fontSize:36,marginBottom:8}}>{icon}</div>
              <div style={{fontSize:13,color:"#888",fontWeight:500}}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{fontSize:13,color:"#bbb",marginBottom:8}}>Available in 6 markets</p>
        <p style={{fontSize:18,color:"#666",marginBottom:32,letterSpacing:4}}>🇺🇸 🇮🇳 🇧🇷 🇨🇳 🇮🇩 🇳🇬</p>

        <p style={{fontSize:12,color:"#ccc"}}>
          By using this app you agree to our{' '}
          <span onClick={() => navigate('/Terms')} style={{color:"#9d174d",cursor:"pointer",textDecoration:"underline"}}>
            Terms & Conditions
          </span>
          {' '}including anonymous data collection for market research.
        </p>
      </div>
    </div>
  )
}
