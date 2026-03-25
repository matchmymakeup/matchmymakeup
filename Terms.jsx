export default function TermsPage() {
  return (
    <div style={{minHeight:'100vh',background:'#fafafa',fontFamily:"'Segoe UI',sans-serif",padding:'24px 16px 60px'}}>
      <div style={{maxWidth:680,margin:'0 auto'}}>
        <button
          onClick={() => window.location.href = '/Home'}
          style={{background:'none',border:'1px solid #e5e7eb',borderRadius:10,padding:'8px 14px',cursor:'pointer',fontSize:13,color:'#666',marginBottom:24,fontWeight:600}}
        >
          ← Back
        </button>

        <h1 style={{fontSize:28,fontWeight:900,color:'#111',marginBottom:4}}>Terms & Conditions</h1>
        <p style={{fontSize:13,color:'#aaa',marginBottom:32}}>Last updated: March 2026</p>

        {[
          { title:"1. Acceptance of Terms", body:"By using MatchMyMakeup ('the App'), you agree to these Terms & Conditions. If you do not agree, please do not use the App." },
          { title:"2. Service Description", body:"MatchMyMakeup is a color-matching service that helps users find makeup products matching scanned colors. We use AI to provide personalized beauty recommendations." },
          { title:"3. Data Collection & Analytics", body:"We collect anonymized usage data to improve our service and provide market insights. This includes:\n\n• Colors scanned (hex values, RGB data)\n• Skin tone and occasion preferences selected\n• Country/region filter selections\n• Language preferences\n• Approximate location (country and city level, derived from IP address)\n• Retailer click-through data (which product links you tap)\n• Session timestamps and frequency of use\n\nThis data is anonymized — we do not link it to personally identifiable information unless you create an account. Aggregated, anonymized data may be shared with or sold to cosmetics brands and manufacturers as market intelligence. Individual-level data is never sold or shared with third parties." },
          { title:"4. Market Research & Brand Partnerships", body:"MatchMyMakeup may use aggregated, anonymized scan data to produce market research reports for cosmetics brands, retailers, and manufacturers. These reports contain no personally identifiable information and are used to help brands understand consumer color preferences by market. By using the App, you consent to your anonymized scan data being used in this way." },
          { title:"5. User-Uploaded Images", body:"Photos you upload to the App for color scanning or the personal library feature are processed locally on your device. They are not stored on our servers and are not shared with any third party. You retain full ownership of your uploaded images." },
          { title:"6. Free Trial & Premium Subscription", body:"The App offers 3 free color scans. Additional scans require a Premium subscription. Subscriptions are billed monthly and can be cancelled at any time. Refunds are available within 7 days of initial purchase." },
          { title:"7. Affiliate Links & Retailer Partnerships", body:"Some 'Shop Now' links in the App may be affiliate links. We may earn a commission if you purchase through these links at no additional cost to you." },
          { title:"8. Intellectual Property", body:"All content, design, and code in the App is owned by MatchMyMakeup. Product names, brand names, and trademarks belong to their respective owners." },
          { title:"9. Limitation of Liability", body:"MatchMyMakeup provides color matching as a guide only. We do not guarantee exact color matches between scanned colors and physical products. Actual product colors may vary due to screen calibration, photography, and manufacturing variation." },
          { title:"10. Contact", body:"For any questions about these terms or our data practices, contact us at: hello@matchmymakeup.app" }
        ].map((section,i) => (
          <div key={i} style={{marginBottom:28,paddingBottom:28,borderBottom:i<9?'1px solid #f0f0f0':'none'}}>
            <h2 style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:10}}>{section.title}</h2>
            <p style={{fontSize:14,color:'#555',lineHeight:1.9,whiteSpace:'pre-line',margin:0}}>{section.body}</p>
          </div>
        ))}

        <button
          onClick={() => window.location.href = '/Home'}
          style={{marginTop:16,background:'linear-gradient(135deg,#9d174d,#7c3aed)',color:'white',border:'none',borderRadius:14,padding:'12px 28px',fontSize:14,fontWeight:700,cursor:'pointer'}}
        >
          ← Back to App
        </button>
      </div>
    </div>
  );
}
