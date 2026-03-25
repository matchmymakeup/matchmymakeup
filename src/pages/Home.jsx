import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff,#fce7f3)",fontFamily:"'Segoe UI',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px",textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:12}}>💄</div>
      <h1 style={{margin:"0 0 8px",fontSize:36,fontWeight:900,background:"linear-gradient(135deg,#9d174d,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MatchMyMakeup</h1>
      <p style={{color:"#9d174d",fontSize:16,marginBottom:40,maxWidth:360,lineHeight:1.6}}>Scan any color and find your perfect makeup match from brands around the world.</p>
      <button onClick={()=>navigate('/ColorScanner')} style={{background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",border:"none",borderRadius:20,padding:"18px 48px",fontSize:18,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 32px rgba(124,58,237,0.35)"}}>
        Start Scanning →
      </button>
      <div style={{marginTop:48,display:"flex",gap:32,flexWrap:"wrap",justifyContent:"center"}}>
        {[["📷","Upload a photo"],["🎨","Pick a color"],["💄","Find your match"]].map(([icon,label],i)=>(
          <div key={i} style={{textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:6}}>{icon}</div>
            <div style={{fontSize:13,color:"#888",fontWeight:500}}>{label}</div>
          </div>
        ))}
      </div>
      <p style={{marginTop:40,fontSize:12,color:"#bbb"}}>🇺🇸 USA · 🇮🇳 India · 🇧🇷 Brazil · 🇨🇳 China · 🇮🇩 Indonesia · 🇳🇬 Nigeria</p>
    </div>
  );
}
