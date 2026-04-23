import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();
  const h3Style = {fontSize:14,color:'#C9A96E',fontWeight:700,margin:'20px 0 8px'};
  return (
    <div style={{minHeight:"100vh",background:"#1C1C1E",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:"#2C2C2E",padding:"16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <button onClick={()=>navigate(-1)} style={{background:"none",border:"1px solid #555",borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:13,color:"#F5F0E8"}}>← Back</button>
        <span style={{fontWeight:800,fontSize:16,color:"#C9A96E"}}>Privacy Policy</span>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"24px 16px 60px",fontSize:13,color:"#F5F0E8",lineHeight:1.8}}>
        <h2 style={{color:"#C9A96E",fontSize:18,fontWeight:700,marginBottom:4}}>MatchMyMakeup Privacy Policy</h2>
        <p style={{color:"#888",fontSize:12,marginBottom:20}}>Last updated: April 2026</p>

        <h3 style={h3Style}>1. Information We Collect</h3>
        <p style={{color:"#ccc"}}>We collect anonymised scan data including scanned colour values (hex, RGB), selected filters (skin tone, occasion, category, country), and retailer click-throughs. No personally identifiable information (name, email, phone) is collected or stored unless you voluntarily provide it.</p>

        <h3 style={h3Style}>2. How We Use Your Data</h3>
        <p style={{color:"#ccc"}}>Scan data is used to: (a) provide colour-matched product recommendations, (b) improve our AI recommendation engine, (c) generate aggregated, anonymised beauty intelligence reports for cosmetics brands. Individual scan data is never sold or shared in identifiable form.</p>

        <h3 style={h3Style}>3. Local Storage</h3>
        <p style={{color:"#ccc"}}>Your Beauty DNA profile, saved shades, saved products, and scan history are stored locally on your device using browser localStorage. This data never leaves your device unless you explicitly share it. Clearing your browser data will delete this information.</p>

        <h3 style={h3Style}>4. Third-Party Services</h3>
        <p style={{color:"#ccc"}}>We use Anthropic (Claude AI) for beauty advice generation, Stripe for payment processing, and Vercel for hosting. Each service has its own privacy policy. We do not share your personal data with these services beyond what is necessary for functionality.</p>

        <h3 style={h3Style}>5. Cookies & Analytics</h3>
        <p style={{color:"#ccc"}}>We use minimal analytics to track page views and scan counts. We do not use third-party tracking cookies or advertising pixels.</p>

        <h3 style={h3Style}>6. Your Rights</h3>
        <p style={{color:"#ccc"}}>You may delete all locally stored data at any time by clearing your browser storage. For questions about data we hold server-side, contact us at privacy@matchmymakeup.ai.</p>

        <h3 style={h3Style}>7. Children</h3>
        <p style={{color:"#ccc"}}>MatchMyMakeup is not directed at children under 13. We do not knowingly collect data from children.</p>

        <h3 style={h3Style}>8. Contact</h3>
        <p style={{color:"#ccc"}}>Craig Pretorius trading as MatchMyMakeup · ABN 64 378 129 621 · Queensland, Australia · privacy@matchmymakeup.ai</p>

        <button onClick={()=>navigate('/')} style={{marginTop:24,background:"#C9A96E",color:"#1C1C1E",border:"none",borderRadius:14,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>← Back to App</button>
      </div>
    </div>
  );
}
