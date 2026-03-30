import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff,#fce7f3)",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:"white",padding:"16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <button onClick={()=>navigate(-1)} style={{background:"none",border:"1px solid #e5e7eb",borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:13,color:"#666"}}>← Back</button>
        <span style={{fontWeight:800,fontSize:16,background:"linear-gradient(135deg,#9d174d,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Terms & Conditions</span>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"24px 16px",fontSize:13,color:"#444",lineHeight:1.8}}>
        <h2 style={{color:"#9d174d",fontSize:16,marginBottom:8}}>MatchMyMakeup Terms & Conditions</h2>
        <p style={{color:"#888",fontSize:12,marginBottom:20}}>Last updated: March 2026</p>

        <h3 style={{fontSize:14,color:"#374151",marginBottom:6}}>1. Data Collection</h3>
        <p>By using MatchMyMakeup you agree that we collect anonymised scan data including scanned colours, selected filters, and retailer click-throughs. This data is used for internal market research and may be aggregated and sold to cosmetics brands as beauty intelligence. No personally identifiable information is collected or stored.</p>

        <h3 style={{fontSize:14,color:"#374151",margin:"16px 0 6px"}}>2. Use of Service</h3>
        <p>MatchMyMakeup is provided for personal, non-commercial use. The colour matching results are indicative only — actual product shades may vary by screen calibration, lighting and individual skin tone.</p>

        <h3 style={{fontSize:14,color:"#374151",margin:"16px 0 6px"}}>3. Affiliate Links</h3>
        <p>Product links may be affiliate links. We may earn a commission if you purchase through these links at no additional cost to you.</p>

        <h3 style={{fontSize:14,color:"#374151",margin:"16px 0 6px"}}>4. Intellectual Property</h3>
        <p>All content, branding and AI personas within MatchMyMakeup are the property of MatchMyMakeup (ABN registered, Australia). Unauthorised reproduction is prohibited.</p>

        <h3 style={{fontSize:14,color:"#374151",margin:"16px 0 6px"}}>5. Changes to Terms</h3>
        <p>We reserve the right to update these terms at any time. Continued use of the app constitutes acceptance of any revised terms.</p>

        <h3 style={{fontSize:14,color:"#374151",margin:"16px 0 6px"}}>6. Contact</h3>
        <p>For any questions contact us via our social channels @MatchMyMakeup_ai.</p>

        <button onClick={()=>navigate(-1)} style={{marginTop:24,background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",border:"none",borderRadius:14,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>← Back to App</button>
      </div>
    </div>
  );
}
