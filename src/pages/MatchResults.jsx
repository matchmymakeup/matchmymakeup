import { useState, useEffect } from "react";

const T = {
  en: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a color first.", scanAgain:"← Scan Another", yourColor:"Your Scanned Color", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again for fresh recommendations! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Color distance", shopNow:"Shop Now →", upsellHeading:"Seeing only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands including Charlotte Tilbury, NARS, Rare Beauty, Colorkey and more.", upsellBtn:"Upgrade to Premium — $4.99/month →" },
  hi: { loading:"आपके परिणाम लोड हो रहे हैं...", noResults:"कोई परिणाम नहीं मिला", scanFirst:"कृपया पहले रंग स्कैन करें।", scanAgain:"← दूसरा स्कैन करें", yourColor:"आपका स्कैन किया रंग", adviceTitle:"ब्यूटी सलाह", consultant:"आपकी व्यक्तिगत ब्यूटी सलाहकार", noAdvice:"ताज़ी सलाह के लिए फिर से स्कैन करें! ✨", matchingProducts:"मिलते-जुलते प्रोडक्ट", bestMatch:"⭐ बेस्ट", colorDistance:"रंग अंतर", shopNow:"अभी खरीदें →", upsellHeading:"केवल 50 में से 10 मैच दिख रहे हैं?", upsellSub:"प्रीमियम सदस्य 500+ प्रोडक्ट से मैच करते हैं।", upsellBtn:"प्रीमियम अपग्रेड करें — $4.99/माह →" },
  pt: { loading:"Carregando seus resultados...", noResults:"Nenhum resultado encontrado", scanFirst:"Por favor, escaneie uma cor primeiro.", scanAgain:"← Escanear Outra", yourColor:"Sua Cor Escaneada", adviceTitle:"Conselho de Beleza", consultant:"Sua consultora de beleza pessoal", noAdvice:"Tente escanear novamente! ✨", matchingProducts:"Produtos Correspondentes", bestMatch:"⭐ Melhor", colorDistance:"Distância de cor", shopNow:"Comprar Agora →", upsellHeading:"Vendo apenas 10 de 50 produtos?", upsellSub:"Membros premium combinam com 500+ produtos de 100+ marcas.", upsellBtn:"Seja Premium — $4,99/mês →" },
  zh: { loading:"正在加载你的结果...", noResults:"未找到结果", scanFirst:"请先扫描一种颜色。", scanAgain:"← 再次扫描", yourColor:"你扫描的颜色", adviceTitle:"美妆建议", consultant:"你的专属美妆顾问", noAdvice:"请重新扫描以获取新建议！✨", matchingProducts:"匹配产品", bestMatch:"⭐ 最佳", colorDistance:"色差", shopNow:"立即购买 →", upsellHeading:"仅看到50款中的10个匹配？", upsellSub:"高级会员可从500+产品中匹配。", upsellBtn:"升级至高级版 — $4.99/月 →" },
  id: { loading:"Memuat hasil Anda...", noResults:"Tidak ada hasil", scanFirst:"Silakan pindai warna terlebih dahulu.", scanAgain:"← Pindai Lagi", yourColor:"Warna Yang Dipindai", adviceTitle:"Saran Kecantikan", consultant:"Konsultan kecantikan pribadi Anda", noAdvice:"Coba pindai lagi! ✨", matchingProducts:"Produk yang Cocok", bestMatch:"⭐ Terbaik", colorDistance:"Jarak warna", shopNow:"Belanja Sekarang →", upsellHeading:"Hanya melihat 10 dari 50 produk?", upsellSub:"Anggota premium mencocokkan dengan 500+ produk.", upsellBtn:"Upgrade ke Premium — $4,99/bulan →" },
  ng: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a colour first, abeg.", scanAgain:"← Scan Another", yourColor:"Your Scanned Colour", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Colour distance", shopNow:"Shop Now →", upsellHeading:"You dey see only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands.", upsellBtn:"Upgrade to Premium — $4.99/month →" },
};

const COUNTRIES_LABELS = { USA:"🇺🇸 USA", India:"🇮🇳 India", Brazil:"🇧🇷 Brazil", Indonesia:"🇮🇩 Indonesia", Nigeria:"🇳🇬 Nigeria", China:"🇨🇳 China" };

function formatAdvice(text) {
  if (!text) return [];
  return text.replace(/#{1,3}\s*/g,"").replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/---+/g,"").split(/\n\n+/).map(p=>p.trim()).filter(p=>p.length>0);
}

export default function MatchResults() {
  const [record, setRecord] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");
  const [upsellDismissed, setUpsellDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("matchResults");
      if (!raw) { setLoading(false); return; }
      const data = JSON.parse(raw);
      setRecord(data);
      setLang(data.lang || "en");
      let prods = [];
      if (Array.isArray(data.matchedProducts)) prods = data.matchedProducts;
      else if (typeof data.matchedProducts === "string") { try { prods = JSON.parse(data.matchedProducts); } catch { prods = []; } }
      setProducts(prods);
    } catch(err) { console.error("[MatchResults] parse error:", err); }
    finally { setLoading(false); }
  }, []);

  const t = T[lang] || T.en;

  if (loading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>✨</div><div style={{color:"#7c3aed",fontSize:16,fontWeight:600}}>{t.loading}</div></div>
    </div>
  );

  if (!record) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{textAlign:"center",padding:32,maxWidth:360}}>
        <div style={{fontSize:48,marginBottom:12}}>😢</div>
        <div style={{color:"#dc2626",marginBottom:8,fontWeight:600}}>{t.noResults}</div>
        <div style={{color:"#888",fontSize:13,marginBottom:16}}>{t.scanFirst}</div>
        <button onClick={()=>window.location.href="/ColorScanner"} style={{background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",border:"none",borderRadius:14,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.scanAgain}</button>
      </div>
    </div>
  );

  const adviceParagraphs = formatAdvice(record.claudeAdvice);
  const personaName = record.personaName || "Maya";
  const personaEmoji = record.personaEmoji || "💄";

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff,#fce7f3)",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:"white",padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:560,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>window.location.href="/ColorScanner"} style={{background:"none",border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#666",fontWeight:600}}>{t.scanAgain}</button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>💄</span>
            <span style={{fontWeight:800,fontSize:16,background:"linear-gradient(135deg,#9d174d,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MatchMyMakeup</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px 60px"}}>
        {/* Scanned color */}
        <div style={{background:"white",borderRadius:20,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:20}}>
          <div style={{fontSize:11,color:"#aaa",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>{t.yourColor}</div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:record.scannedHex,flexShrink:0,boxShadow:`0 6px 24px ${record.scannedHex}80`}} />
            <div>
              <div style={{fontFamily:"monospace",fontSize:24,fontWeight:800,color:"#1a1a1a"}}>{record.scannedHex}</div>
              <div style={{color:"#888",fontSize:12,marginTop:3}}>R <b style={{color:"#ef4444"}}>{record.scannedRed}</b> &nbsp; G <b style={{color:"#22c55e"}}>{record.scannedGreen}</b> &nbsp; B <b style={{color:"#3b82f6"}}>{record.scannedBlue}</b></div>
              {(record.skinTone||record.occasion||record.country) && (
                <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                  {record.skinTone && <span style={{background:"#fdf2f8",color:"#9d174d",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{record.skinTone}</span>}
                  {record.occasion && <span style={{background:"#f3e8ff",color:"#7c3aed",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{record.occasion}</span>}
                  {record.country && <span style={{background:"#ecfdf5",color:"#065f46",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{COUNTRIES_LABELS[record.country]||record.country}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Persona advice */}
        <div style={{background:"linear-gradient(135deg,#fdf2f8,#f3e8ff)",border:"1px solid #f9a8d4",borderRadius:20,padding:20,marginBottom:20,boxShadow:"0 4px 20px rgba(157,23,77,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#9d174d,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{personaEmoji}</div>
            <div>
              <div style={{fontWeight:800,fontSize:15,color:"#9d174d"}}>{personaName}'s {t.adviceTitle}</div>
              <div style={{fontSize:11,color:"#aaa"}}>{t.consultant}</div>
            </div>
          </div>
          {adviceParagraphs.length > 0 ? (
            <div style={{fontSize:14,lineHeight:1.8,color:"#374151"}}>
              {adviceParagraphs.map((para,i) => <p key={i} style={{margin:"0 0 10px 0"}}>{para}</p>)}
            </div>
          ) : <p style={{color:"#aaa",fontSize:14,margin:0}}>{t.noAdvice}</p>}
        </div>

        {/* Upsell */}
        {!upsellDismissed && (
          <div style={{position:"relative",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff)",border:"1px solid #f0abda",borderRadius:20,padding:"18px 44px 18px 18px",marginBottom:20}}>
            <button onClick={()=>setUpsellDismissed(true)} style={{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#c084fc",padding:"2px 6px"}}>✕</button>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{fontSize:28,flexShrink:0,marginTop:2}}>✨</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:14,color:"#1a1a1a",marginBottom:4}}>{t.upsellHeading}</div>
                <div style={{fontSize:12,color:"#7c6a8a",lineHeight:1.5,marginBottom:12}}>{t.upsellSub}</div>
                <a href="mailto:hello@matchmymakeup.ai" style={{display:"inline-block",background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",borderRadius:12,padding:"9px 18px",fontSize:12,fontWeight:700,textDecoration:"none"}}>{t.upsellBtn}</a>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div>
            <div style={{fontWeight:800,fontSize:16,color:"#1a1a1a",marginBottom:12}}>🎯 {products.length} {t.matchingProducts}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {products.map((p,i) => (
                <div key={i} style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column"}}>
                  <div style={{height:80,background:p.hexCode||"#f3e8ff",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    <div style={{width:52,height:52,borderRadius:"50%",background:p.hexCode||"#e9d5ff",border:"3px solid rgba(255,255,255,0.6)"}} />
                    <div style={{position:"absolute",top:6,left:6,background:i===0?"linear-gradient(135deg,#f59e0b,#ef4444)":"rgba(0,0,0,0.4)",color:"white",borderRadius:8,padding:"2px 7px",fontSize:10,fontWeight:700}}>
                      {i===0?t.bestMatch:`#${i+1}`}
                    </div>
                  </div>
                  <div style={{padding:"10px 10px 12px",flex:1,display:"flex",flexDirection:"column"}}>
                    <div style={{fontSize:10,color:"#9d174d",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{p.brand}</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#1a1a1a",lineHeight:1.3,marginBottom:3,flex:1}}>{p.name}</div>
                    <div style={{fontSize:11,color:"#888",marginBottom:4}}>{p.colorName && <span>{p.colorName} · </span>}<span style={{textTransform:"capitalize"}}>{p.category}</span></div>
                    {p.price && <div style={{fontSize:13,fontWeight:700,color:"#7c3aed",marginBottom:6}}>{p.currency||"$"}{p.price}</div>}
                    <div style={{fontSize:10,color:"#aaa",marginBottom:8}}>{t.colorDistance}: <b style={{color:"#374151"}}>{p.colorDistance}</b></div>
                    {p.retailerUrl && (
                      <a href={p.retailerUrl} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",borderRadius:10,padding:"7px 0",fontSize:11,fontWeight:700,textDecoration:"none"}}>{t.shopNow}</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {products.length === 0 && <div style={{textAlign:"center",padding:"32px 0",color:"#aaa",fontSize:14}}>{t.noResults}</div>}
      </div>
    </div>
  );
}
