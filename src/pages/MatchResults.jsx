import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { findMoreMatches } from "../products.js";

function getTrialInfo() {
  try {
    const start = localStorage.getItem('mmm_trial_start');
    if (!start) return { active: false, started: false, daysLeft: 0, scansSaved: 0 };
    const startDate = new Date(start);
    const now = new Date();
    const elapsed = Math.floor((now - startDate) / 86400000);
    const daysLeft = Math.max(0, 7 - elapsed);
    const lib = JSON.parse(localStorage.getItem('mmm_library') || '{}');
    const scansSaved = (lib.scans || []).length;
    return { active: daysLeft > 0, started: true, daysLeft, scansSaved, elapsed };
  } catch { return { active: false, started: false, daysLeft: 0, scansSaved: 0 }; }
}
function startTrial() {
  localStorage.setItem('mmm_trial_start', new Date().toISOString());
}

const T = {
  en: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a color first.", scanAgain:"← Scan Another", yourColor:"Your Scanned Color", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again for fresh recommendations! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Color distance", shopNow:"Shop Now →", upsellHeading:"Seeing only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands including Charlotte Tilbury, NARS, Rare Beauty, Colorkey and more.", upsellBtn:"Upgrade to Premium — $4.99/month →" },
  hi: { loading:"आपके परिणाम लोड हो रहे हैं...", noResults:"कोई परिणाम नहीं मिला", scanFirst:"कृपया पहले रंग स्कैन करें।", scanAgain:"← दूसरा स्कैन करें", yourColor:"आपका स्कैन किया रंग", adviceTitle:"ब्यूटी सलाह", consultant:"आपकी व्यक्तिगत ब्यूटी सलाहकार", noAdvice:"ताज़ी सलाह के लिए फिर से स्कैन करें! ✨", matchingProducts:"मिलते-जुलते प्रोडक्ट", bestMatch:"⭐ बेस्ट", colorDistance:"रंग अंतर", shopNow:"अभी खरीदें →", upsellHeading:"केवल 50 में से 10 मैच दिख रहे हैं?", upsellSub:"प्रीमियम सदस्य 500+ प्रोडक्ट से मैच करते हैं।", upsellBtn:"प्रीमियम अपग्रेड करें — $4.99/माह →" },
  pt: { loading:"Carregando seus resultados...", noResults:"Nenhum resultado encontrado", scanFirst:"Por favor, escaneie uma cor primeiro.", scanAgain:"← Escanear Outra", yourColor:"Sua Cor Escaneada", adviceTitle:"Conselho de Beleza", consultant:"Sua consultora de beleza pessoal", noAdvice:"Tente escanear novamente! ✨", matchingProducts:"Produtos Correspondentes", bestMatch:"⭐ Melhor", colorDistance:"Distância de cor", shopNow:"Comprar Agora →", upsellHeading:"Vendo apenas 10 de 50 produtos?", upsellSub:"Membros premium combinam com 500+ produtos de 100+ marcas.", upsellBtn:"Seja Premium — $4,99/mês →" },
  zh: { loading:"正在加载你的结果...", noResults:"未找到结果", scanFirst:"请先扫描一种颜色。", scanAgain:"← 再次扫描", yourColor:"你扫描的颜色", adviceTitle:"美妆建议", consultant:"你的专属美妆顾问", noAdvice:"请重新扫描以获取新建议！✨", matchingProducts:"匹配产品", bestMatch:"⭐ 最佳", colorDistance:"色差", shopNow:"立即购买 →", upsellHeading:"仅看到50款中的10个匹配？", upsellSub:"高级会员可从500+产品中匹配。", upsellBtn:"升级至高级版 — $4.99/月 →" },
  id: { loading:"Memuat hasil Anda...", noResults:"Tidak ada hasil", scanFirst:"Silakan pindai warna terlebih dahulu.", scanAgain:"← Pindai Lagi", yourColor:"Warna Yang Dipindai", adviceTitle:"Saran Kecantikan", consultant:"Konsultan kecantikan pribadi Anda", noAdvice:"Coba pindai lagi! ✨", matchingProducts:"Produk yang Cocok", bestMatch:"⭐ Terbaik", colorDistance:"Jarak warna", shopNow:"Belanja Sekarang →", upsellHeading:"Hanya melihat 10 dari 50 produk?", upsellSub:"Anggota premium mencocokkan dengan 500+ produk.", upsellBtn:"Upgrade ke Premium — $4,99/bulan →" },
  ng: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a colour first, abeg.", scanAgain:"← Scan Another", yourColor:"Your Scanned Colour", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Colour distance", shopNow:"Shop Now →", upsellHeading:"You dey see only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands.", upsellBtn:"Upgrade to Premium — $4.99/month →" },
  es: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a color first.", scanAgain:"← Scan Another", yourColor:"Your Scanned Color", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again for fresh recommendations! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Color distance", shopNow:"Shop Now →", upsellHeading:"Seeing only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands.", upsellBtn:"Upgrade to Premium — $4.99/month →" },
  ar: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a color first.", scanAgain:"← Scan Another", yourColor:"Your Scanned Color", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again for fresh recommendations! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Color distance", shopNow:"Shop Now →", upsellHeading:"Seeing only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands.", upsellBtn:"Upgrade to Premium — $4.99/month →" },
  fr: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a color first.", scanAgain:"← Scan Another", yourColor:"Your Scanned Color", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again for fresh recommendations! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Color distance", shopNow:"Shop Now →", upsellHeading:"Seeing only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands.", upsellBtn:"Upgrade to Premium — $4.99/month →" },
  bn: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a color first.", scanAgain:"← Scan Another", yourColor:"Your Scanned Color", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again for fresh recommendations! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Color distance", shopNow:"Shop Now →", upsellHeading:"Seeing only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands.", upsellBtn:"Upgrade to Premium — $4.99/month →" },
  sw: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a color first.", scanAgain:"← Scan Another", yourColor:"Your Scanned Color", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again for fresh recommendations! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Color distance", shopNow:"Shop Now →", upsellHeading:"Seeing only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands.", upsellBtn:"Upgrade to Premium — $4.99/month →" },
};

const COUNTRIES_LABELS = { USA:"🇺🇸 USA", India:"🇮🇳 India", Brazil:"🇧🇷 Brazil", Indonesia:"🇮🇩 Indonesia", Nigeria:"🇳🇬 Nigeria", China:"🇨🇳 China", "Latin America":"🇲🇽 Latin America", "Middle East":"🇸🇦 Middle East", France:"🇫🇷 France", Bangladesh:"🇧🇩 Bangladesh", "East Africa":"🇰🇪 East Africa" };

function formatAdvice(text) {
  if (!text) return [];
  return text.replace(/#{1,3}\s*/g,"").replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/---+/g,"").split(/\n\n+/).map(p=>p.trim()).filter(p=>p.length>0);
}

function getProfile() {
  try { return JSON.parse(localStorage.getItem('mmm_profile') || '{}'); } catch { return {}; }
}
function saveProfile(data) {
  const p = { ...getProfile(), ...data };
  localStorage.setItem('mmm_profile', JSON.stringify(p));
  return p;
}
function getScanCount() {
  try { const lib = JSON.parse(localStorage.getItem('mmm_library') || '{}'); return (lib.scans || []).length; } catch { return 0; }
}

const SKIN_TONES = [
  { id:'fair', label:'🤍 Fair' },
  { id:'light', label:'🍑 Light' },
  { id:'medium', label:'🌼 Medium' },
  { id:'tan', label:'🌻 Tan' },
  { id:'deep', label:'🤎 Deep' },
  { id:'deep+', label:'🖤 Deep+' },
];
const AGE_RANGES = ['Under 18','18-24','25-34','35-44','45-54','55+'];

export default function MatchResults() {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");
  const [upsellDismissed, setUpsellDismissed] = useState(false);

  const [showSkinToneSheet, setShowSkinToneSheet] = useState(false);
  const [showAgeSheet, setShowAgeSheet] = useState(false);
  const [skinToneBannerDismissed, setSkinToneBannerDismissed] = useState(false);
  const [ageBannerDismissed, setAgeBannerDismissed] = useState(false);
  const [bonusProducts, setBonusProducts] = useState([]);
  const [trialInfo, setTrialInfo] = useState(getTrialInfo);
  const shareCanvasRef = useRef(null);

  const profile = getProfile();
  const scanCount = getScanCount();
  const showSkinToneBanner = !profile.skinTone && !skinToneBannerDismissed;
  const showAgeBanner = scanCount >= 2 && !profile.ageRange && profile.skinTone && !ageBannerDismissed;

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

  function handleSkinToneSelect(tone) {
    saveProfile({ skinTone: tone });
    setShowSkinToneSheet(false);
    setSkinToneBannerDismissed(true);
    if (record) {
      const more = findMoreMatches(record.scannedRed, record.scannedGreen, record.scannedBlue, record.country, record.category, 10, 5);
      setBonusProducts(more);
    }
  }

  function handleAgeSelect(age) {
    saveProfile({ ageRange: age });
    setShowAgeSheet(false);
    setAgeBannerDismissed(true);
  }

  function handleStartTrial() {
    startTrial();
    setTrialInfo(getTrialInfo());
  }

  function generateShareCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    // Background gradient
    const grad = ctx.createLinearGradient(0,0,600,400);
    grad.addColorStop(0,'#fdf2f8'); grad.addColorStop(0.5,'#f3e8ff'); grad.addColorStop(1,'#fce7f3');
    ctx.fillStyle = grad; ctx.fillRect(0,0,600,400);
    // Color swatch
    ctx.beginPath(); ctx.arc(120,160,60,0,Math.PI*2);
    ctx.fillStyle = record.scannedHex; ctx.fill();
    ctx.strokeStyle = 'white'; ctx.lineWidth = 4; ctx.stroke();
    // Shadow ring
    ctx.beginPath(); ctx.arc(120,160,64,0,Math.PI*2);
    ctx.strokeStyle = record.scannedHex+'40'; ctx.lineWidth = 8; ctx.stroke();
    // Text
    ctx.fillStyle = '#9d174d'; ctx.font = 'bold 28px Segoe UI, sans-serif';
    ctx.fillText('My Perfect Match', 210, 120);
    ctx.fillStyle = '#1a1a1a'; ctx.font = 'bold 36px monospace';
    ctx.fillText(record.scannedHex, 210, 170);
    if (allProducts[0]) {
      ctx.fillStyle = '#7c3aed'; ctx.font = 'bold 18px Segoe UI, sans-serif';
      ctx.fillText(`${allProducts[0].brand} — ${allProducts[0].name}`, 210, 210);
    }
    // Persona
    ctx.fillStyle = '#9d174d'; ctx.font = '16px Segoe UI, sans-serif';
    ctx.fillText(`Matched by ${personaName} ${personaEmoji}`, 210, 250);
    // Watermark
    ctx.fillStyle = '#c084fc'; ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.fillText('matchmymakeup.ai', 210, 350);
    // Lipstick emoji area
    ctx.font = '48px serif'; ctx.fillText('\uD83D\uDC84', 430, 340);
    // Download
    const link = document.createElement('a');
    link.download = 'my-match.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

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
        <button onClick={()=>navigate('/ColorScanner')} style={{background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",border:"none",borderRadius:14,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.scanAgain}</button>
      </div>
    </div>
  );

  const adviceParagraphs = formatAdvice(record.claudeAdvice);
  const personaName = record.personaName || "Maya";
  const personaEmoji = record.personaEmoji || "💄";
  const allProducts = [...products, ...bonusProducts];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff,#fce7f3)",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:"white",padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:560,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>navigate('/ColorScanner')} style={{background:"none",border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#666",fontWeight:600}}>{t.scanAgain}</button>
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

        {/* Progressive: Skin tone banner (after 1st scan) */}
        {showSkinToneBanner && (
          <div style={{position:"relative",background:"linear-gradient(135deg,#fffbeb,#fef3c7)",border:"1px solid #fbbf24",borderRadius:16,padding:"14px 40px 14px 14px",marginBottom:16,cursor:"pointer"}} onClick={()=>setShowSkinToneSheet(true)}>
            <button onClick={e=>{e.stopPropagation();setSkinToneBannerDismissed(true);}} style={{position:"absolute",top:8,right:8,background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#d97706",padding:"2px 6px"}}>✕</button>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>✨</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#92400e"}}>{personaName} found {products.length} matches. Tell us your skin tone and unlock 5 more →</div>
              </div>
            </div>
          </div>
        )}

        {/* Progressive: Age range banner (after 2nd scan) */}
        {showAgeBanner && (
          <div style={{position:"relative",background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1px solid #86efac",borderRadius:16,padding:"14px 40px 14px 14px",marginBottom:16,cursor:"pointer"}} onClick={()=>setShowAgeSheet(true)}>
            <button onClick={e=>{e.stopPropagation();setAgeBannerDismissed(true);}} style={{position:"absolute",top:8,right:8,background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#16a34a",padding:"2px 6px"}}>✕</button>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>🎂</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#166534"}}>Add your age range and get personalised advice from {personaName} →</div>
              </div>
            </div>
          </div>
        )}

        {/* Profile link */}
        <div style={{textAlign:"center",marginBottom:16}}>
          <button onClick={()=>navigate('/Profile')} style={{background:"none",border:"1px solid #e5e7eb",borderRadius:20,padding:"8px 20px",cursor:"pointer",fontSize:12,color:"#7c3aed",fontWeight:600}}>
            🧬 Complete Your Beauty DNA Profile
          </button>
        </div>

        {/* Share card button */}
        <div style={{textAlign:"center",marginBottom:16}}>
          <button onClick={generateShareCard} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:20,padding:"10px 24px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#7c3aed"}}>
            📤 Share My Match →
          </button>
        </div>

        {/* Reverse trial / upsell */}
        {!upsellDismissed && (
          <div style={{position:"relative",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff)",border:"1px solid #f0abda",borderRadius:20,padding:"18px 44px 18px 18px",marginBottom:20}}>
            <button onClick={()=>setUpsellDismissed(true)} style={{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#c084fc",padding:"2px 6px"}}>✕</button>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{fontSize:28,flexShrink:0,marginTop:2}}>✨</div>
              <div style={{flex:1}}>
                {!trialInfo.started ? (
                  <>
                    <div style={{fontWeight:800,fontSize:14,color:"#1a1a1a",marginBottom:4}}>{t.upsellHeading}</div>
                    <div style={{fontSize:12,color:"#7c6a8a",lineHeight:1.5,marginBottom:12}}>{t.upsellSub}</div>
                    <button onClick={handleStartTrial} style={{display:"inline-block",background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",borderRadius:12,padding:"9px 18px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>
                      Try Premium Free — 7 days, no card needed →
                    </button>
                  </>
                ) : trialInfo.active ? (
                  <>
                    <div style={{fontWeight:800,fontSize:14,color:"#7c3aed",marginBottom:4}}>🎉 Premium Trial Active</div>
                    <div style={{fontSize:12,color:"#7c6a8a",lineHeight:1.5,marginBottom:4}}>{trialInfo.daysLeft} day{trialInfo.daysLeft!==1?'s':''} left in your free trial</div>
                    <div style={{fontSize:11,color:"#aaa"}}>Matching against 500+ products from 100+ brands</div>
                  </>
                ) : (
                  <>
                    <div style={{fontWeight:800,fontSize:14,color:"#1a1a1a",marginBottom:4}}>Your trial ended</div>
                    <div style={{fontSize:12,color:"#7c6a8a",lineHeight:1.5,marginBottom:12}}>Maya saved {trialInfo.scansSaved} scan{trialInfo.scansSaved!==1?'s':''} for you — keep access for $4.99/month</div>
                    <a href="mailto:hello@matchmymakeup.ai" style={{display:"inline-block",background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",borderRadius:12,padding:"9px 18px",fontSize:12,fontWeight:700,textDecoration:"none"}}>
                      Upgrade to Premium — $4.99/month →
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {allProducts.length > 0 && (
          <div>
            <div style={{fontWeight:800,fontSize:16,color:"#1a1a1a",marginBottom:12}}>🎯 {allProducts.length} {t.matchingProducts}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {allProducts.map((p,i) => (
                <div key={p.id||i} style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column",position:"relative"}}>
                  {i >= products.length && <div style={{position:"absolute",top:0,left:0,right:0,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:"white",textAlign:"center",fontSize:9,fontWeight:700,padding:"3px 0",letterSpacing:0.5,textTransform:"uppercase"}}>Bonus Match</div>}
                  <div style={{height:80,background:p.hexCode||"#f3e8ff",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",marginTop:i>=products.length?18:0}}>
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
        {allProducts.length === 0 && <div style={{textAlign:"center",padding:"32px 0",color:"#aaa",fontSize:14}}>{t.noResults}</div>}
      </div>

      {/* Skin tone bottom sheet */}
      {showSkinToneSheet && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={()=>setShowSkinToneSheet(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)"}} />
          <div style={{position:"relative",background:"white",borderRadius:"24px 24px 0 0",padding:"28px 20px 36px",width:"100%",maxWidth:560,boxShadow:"0 -8px 40px rgba(0,0,0,0.15)"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 20px"}} />
            <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:"#1a1a1a",textAlign:"center"}}>What's your skin tone?</h3>
            <p style={{margin:"0 0 20px",fontSize:12,color:"#888",textAlign:"center"}}>This helps {personaName} find better matches for you</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {SKIN_TONES.map(st => (
                <button key={st.id} onClick={()=>handleSkinToneSelect(st.id)} style={{padding:"16px 8px",borderRadius:16,border:"2px solid #f3ecf9",background:"white",cursor:"pointer",fontSize:14,fontWeight:600,color:"#333",textAlign:"center",transition:"all 0.15s"}}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Age range bottom sheet */}
      {showAgeSheet && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={()=>setShowAgeSheet(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)"}} />
          <div style={{position:"relative",background:"white",borderRadius:"24px 24px 0 0",padding:"28px 20px 36px",width:"100%",maxWidth:560,boxShadow:"0 -8px 40px rgba(0,0,0,0.15)"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 20px"}} />
            <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:"#1a1a1a",textAlign:"center"}}>What's your age range?</h3>
            <p style={{margin:"0 0 20px",fontSize:12,color:"#888",textAlign:"center"}}>{personaName} will personalise advice for your age group</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {AGE_RANGES.map(age => (
                <button key={age} onClick={()=>handleAgeSelect(age)} style={{padding:"14px 18px",borderRadius:14,border:"2px solid #f3ecf9",background:"white",cursor:"pointer",fontSize:15,fontWeight:600,color:"#333",textAlign:"left",transition:"all 0.15s"}}>
                  {age}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
