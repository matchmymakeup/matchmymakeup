import { useNavigate } from "react-router-dom";
import PageBackBar from "../components/PageBackBar";

export default function Terms() {
  const navigate = useNavigate();
  const h3Style = {fontSize:14,color:'#C9A96E',fontWeight:700,margin:'20px 0 8px'};
  return (
    <div style={{minHeight:"100vh",background:"#1C1C1E",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"24px 16px 60px",fontSize:13,color:"#F5F0E8",lineHeight:1.8}}>
        <PageBackBar onBack={() => navigate(-1)} label="← Back" title="Terms & Conditions" />
        <h2 style={{color:"#C9A96E",fontSize:18,fontWeight:700,marginBottom:4}}>MatchMyMakeup Terms & Conditions</h2>
        <p style={{color:"#888",fontSize:12,marginBottom:20}}>Last updated: April 2026</p>

        <h3 style={h3Style}>1. Data Collection</h3>
        <p style={{color:"#ccc"}}>By using MatchMyMakeup you agree that we collect anonymised scan data including scanned colours, selected filters, and retailer click-throughs. This data is used for internal market research and may be aggregated and sold to cosmetics brands as beauty intelligence. No personally identifiable information is collected or stored.</p>

        <h3 style={h3Style}>2. Use of Service</h3>
        <p style={{color:"#ccc"}}>MatchMyMakeup is provided for personal, non-commercial use. The colour matching results are indicative only — actual product shades may vary by screen calibration, lighting and individual skin tone.</p>

        <h3 style={h3Style}>3. Affiliate Links</h3>
        <p style={{color:"#ccc"}}>Product links may be affiliate links. We may earn a commission if you purchase through these links at no additional cost to you.</p>

        <h3 style={h3Style}>4. Intellectual Property</h3>
        <p style={{color:"#ccc"}}>All content, branding, AI personas and algorithms within MatchMyMakeup are the property of Craig Pretorius trading as MatchMyMakeup (ABN 64 378 129 621, Australia). Unauthorised reproduction, reverse engineering, or distribution is prohibited. MatchMyMakeup is a registered trademark (TM #2640607).</p>

        <h3 style={h3Style}>5. Premium Subscriptions</h3>
        <p style={{color:"#ccc"}}>Premium subscriptions are processed via Stripe. Subscriptions auto-renew monthly. You may cancel at any time. Refunds are handled in accordance with Australian Consumer Law.</p>

        <h3 style={h3Style}>6. Limitation of Liability</h3>
        <p style={{color:"#ccc"}}>MatchMyMakeup provides beauty product recommendations for informational purposes only. We are not liable for allergic reactions, skin irritation, or dissatisfaction with recommended products. Always patch-test new products.</p>

        <h3 style={h3Style}>7. Changes to Terms</h3>
        <p style={{color:"#ccc"}}>We reserve the right to update these terms at any time. Continued use of the app constitutes acceptance of any revised terms.</p>

        <h3 style={h3Style}>8. Contact</h3>
        <p style={{color:"#ccc"}}>Craig Pretorius trading as MatchMyMakeup · ABN 64 378 129 621 · Queensland, Australia · legal@matchmymakeup.ai</p>

        <button onClick={()=>navigate('/')} style={{marginTop:24,background:"#C9A96E",color:"#1C1C1E",border:"none",borderRadius:14,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>← Back to App</button>
      </div>
    </div>
  );
}
