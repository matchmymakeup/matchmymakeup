import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getColourName } from "../utils/colourNames.js";

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
  es: { loading:"Cargando tus resultados...", noResults:"No se encontraron resultados", scanFirst:"Por favor, escanea un color primero.", scanAgain:"← Escanear otro", yourColor:"Tu color escaneado", adviceTitle:"Consejos de belleza", consultant:"Tu consultora de belleza personal", noAdvice:"¡Intenta escanear de nuevo! ✨", matchingProducts:"Productos coincidentes", bestMatch:"⭐ Mejor", colorDistance:"Distancia de color", shopNow:"Comprar ahora →", upsellHeading:"¿Solo ves 10 coincidencias de 50 productos?", upsellSub:"Los miembros premium comparan con 500+ productos de 100+ marcas.", upsellBtn:"Ser Premium — $4,99/mes →" },
  ar: { loading:"جارٍ تحميل نتائجك...", noResults:"لم يتم العثور على نتائج", scanFirst:"يرجى مسح لون أولاً.", scanAgain:"← مسح آخر", yourColor:"لونك الممسوح", adviceTitle:"نصائح الجمال", consultant:"مستشارة الجمال الخاصة بك", noAdvice:"حاول المسح مرة أخرى! ✨", matchingProducts:"المنتجات المطابقة", bestMatch:"⭐ الأفضل", colorDistance:"مسافة اللون", shopNow:"تسوق الآن →", upsellHeading:"ترى 10 نتائج فقط من 50 منتجًا؟", upsellSub:"أعضاء بريميوم يقارنون مع 500+ منتج من 100+ علامة تجارية.", upsellBtn:"ترقية إلى بريميوم — $4.99/شهر →" },
  fr: { loading:"Chargement de vos résultats...", noResults:"Aucun résultat trouvé", scanFirst:"Veuillez d'abord scanner une couleur.", scanAgain:"← Scanner une autre", yourColor:"Votre couleur scannée", adviceTitle:"Conseils beauté", consultant:"Votre consultante beauté personnelle", noAdvice:"Essayez de scanner à nouveau ! ✨", matchingProducts:"Produits correspondants", bestMatch:"⭐ Meilleur", colorDistance:"Distance de couleur", shopNow:"Acheter maintenant →", upsellHeading:"Vous ne voyez que 10 résultats sur 50 produits ?", upsellSub:"Les membres premium comparent avec 500+ produits de 100+ marques.", upsellBtn:"Passer à Premium — 4,99 $/mois →" },
  bn: { loading:"আপনার ফলাফল লোড হচ্ছে...", noResults:"কোনো ফলাফল পাওয়া যায়নি", scanFirst:"অনুগ্রহ করে প্রথমে একটি রং স্ক্যান করুন।", scanAgain:"← আরেকটি স্ক্যান", yourColor:"আপনার স্ক্যান করা রং", adviceTitle:"সৌন্দর্য পরামর্শ", consultant:"আপনার ব্যক্তিগত সৌন্দর্য পরামর্শদাতা", noAdvice:"আবার স্ক্যান করে দেখুন! ✨", matchingProducts:"মিলে যাওয়া পণ্য", bestMatch:"⭐ সেরা", colorDistance:"রঙের দূরত্ব", shopNow:"এখনই কিনুন →", upsellHeading:"৫০টি পণ্যের মধ্যে মাত্র ১০টি দেখছেন?", upsellSub:"প্রিমিয়াম সদস্যরা ৫০০+ পণ্যের সাথে মিলান করেন।", upsellBtn:"প্রিমিয়ামে আপগ্রেড করুন — $৪.৯৯/মাস →" },
  sw: { loading:"Inapakia matokeo yako...", noResults:"Hakuna matokeo yaliyopatikana", scanFirst:"Tafadhali changanua rangi kwanza.", scanAgain:"← Changanua nyingine", yourColor:"Rangi yako iliyochanganuliwa", adviceTitle:"Ushauri wa uzuri", consultant:"Mshauri wako binafsi wa uzuri", noAdvice:"Jaribu kuchanganua tena! ✨", matchingProducts:"Bidhaa zinazolingana", bestMatch:"⭐ Bora", colorDistance:"Umbali wa rangi", shopNow:"Nunua sasa →", upsellHeading:"Unaona mechi 10 tu kati ya bidhaa 50?", upsellSub:"Wanachama wa Premium wanalinganisha na bidhaa 500+ kutoka kwa nembo 100+.", upsellBtn:"Boresha hadi Premium — $4.99/mwezi →" },
};

const COUNTRIES_LABELS = { USA:"🇺🇸 USA", Australia:"🇦🇺 Australia", India:"🇮🇳 India", Brazil:"🇧🇷 Brazil", Indonesia:"🇮🇩 Indonesia", Nigeria:"🇳🇬 Nigeria", China:"🇨🇳 China", "Latin America":"🇲🇽 Latin America", "Middle East":"🇸🇦 Middle East", France:"🇫🇷 France", Bangladesh:"🇧🇩 Bangladesh", "East Africa":"🇰🇪 East Africa" };

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
  const [showSaveShade, setShowSaveShade] = useState(false);
  const [savedProductIds, setSavedProductIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('mmm_my_products') || '[]').map(p => p.productName + p.brand)); } catch { return new Set(); }
  });
  const [justSaved, setJustSaved] = useState(null);
  const [shadeName, setShadeName] = useState('');

  const profile = getProfile();
  const scanCount = getScanCount();
  const showSkinToneBanner = !profile.skinTone && !skinToneBannerDismissed;
  const showAgeBanner = scanCount >= 2 && !profile.ageRange && profile.skinTone && !ageBannerDismissed;

  useEffect(() => {
    // Activate trial after successful Stripe checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id') && !getTrialInfo().started) {
      startTrial();
      setTrialInfo(getTrialInfo());
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }

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

  async function handleSkinToneSelect(tone) {
    saveProfile({ skinTone: tone });
    setShowSkinToneSheet(false);
    setSkinToneBannerDismissed(true);
    if (record) {
      try {
        const res = await fetch('/api/match', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ r: record.scannedRed, g: record.scannedGreen, b: record.scannedBlue, country: record.country, category: record.category, skip: 10, limit: 5 })
        });
        const data = await res.json();
        if (data.matches) setBonusProducts(data.matches);
      } catch {}
    }
  }

  function handleAgeSelect(age) {
    saveProfile({ ageRange: age });
    setShowAgeSheet(false);
    setAgeBannerDismissed(true);
  }

  async function handleCheckout() {
    console.log('[MatchResults] handleCheckout called');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      });
      const data = await res.json();
      console.log('[MatchResults] checkout response:', data);
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Failed to start checkout');
    } catch (err) { console.error('[MatchResults] checkout error:', err); alert('Something went wrong. Please try again.'); }
  }

  function handleSaveShade() {
    if (!shadeName || !record) return;
    try {
      const shades = JSON.parse(localStorage.getItem('mmm_my_shades') || '[]');
      shades.push({ id: Date.now(), name: shadeName, hex: record.scannedHex });
      localStorage.setItem('mmm_my_shades', JSON.stringify(shades));
    } catch {}
    setShadeName(''); setShowSaveShade(false);
  }

  function saveProductToLibrary(p) {
    const key = p.name + p.brand;
    if (savedProductIds.has(key)) return;
    try {
      const existing = JSON.parse(localStorage.getItem('mmm_my_products') || '[]');
      existing.push({ id: Date.now(), productName: p.name, brand: p.brand, category: p.category, hex: p.hexCode, colorName: p.colorName, price: p.price, currency: p.currency, rating: 5, notes: '', dateSaved: new Date().toISOString() });
      localStorage.setItem('mmm_my_products', JSON.stringify(existing));
      setSavedProductIds(prev => new Set([...prev, key]));
      setJustSaved(key);
      setTimeout(() => setJustSaved(null), 2000);
    } catch {}
  }

  function getShopUrl(p) {
    if (p.retailerUrl && p.retailerUrl.startsWith('http') && !p.retailerUrl.includes('google.com/search')) return p.retailerUrl;
    const q = encodeURIComponent(p.brand + ' ' + p.name);
    const userCountry = record?.country || '';
    switch (userCountry) {
      case 'USA': case 'Australia': return `https://www.sephora.com/search?keyword=${q}`;
      case 'India': return `https://www.nykaa.com/search/result/?q=${q}`;
      case 'Indonesia': return `https://shopee.co.id/search?keyword=${q}`;
      case 'Nigeria': return `https://www.jumia.com.ng/catalog/?q=${q}`;
      case 'China': return `https://s.taobao.com/search?q=${q}`;
      case 'Brazil': return `https://www.amazon.com.br/s?k=${q}`;
      default: return `https://www.google.com/search?q=${encodeURIComponent(p.brand + ' ' + p.name + ' buy online')}`;
    }
  }

  function generateShareCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    // Background gradient
    const grad = ctx.createLinearGradient(0,0,600,400);
    grad.addColorStop(0,'#2C2C2E'); grad.addColorStop(0.5,'#2C2C2E'); grad.addColorStop(1,'#fce7f3');
    ctx.fillStyle = grad; ctx.fillRect(0,0,600,400);
    // Color swatch
    ctx.beginPath(); ctx.arc(120,160,60,0,Math.PI*2);
    ctx.fillStyle = record.scannedHex; ctx.fill();
    ctx.strokeStyle = 'white'; ctx.lineWidth = 4; ctx.stroke();
    // Shadow ring
    ctx.beginPath(); ctx.arc(120,160,64,0,Math.PI*2);
    ctx.strokeStyle = record.scannedHex+'40'; ctx.lineWidth = 8; ctx.stroke();
    // Text
    ctx.fillStyle = '#B76E79'; ctx.font = 'bold 28px Segoe UI, sans-serif';
    ctx.fillText('My Perfect Match', 210, 120);
    ctx.fillStyle = '#1a1a1a'; ctx.font = 'bold 36px monospace';
    ctx.fillText(record.scannedHex, 210, 170);
    if (allProducts[0]) {
      ctx.fillStyle = '#C9A96E'; ctx.font = 'bold 18px Segoe UI, sans-serif';
      ctx.fillText(`${allProducts[0].brand} — ${allProducts[0].name}`, 210, 210);
    }
    // Persona
    ctx.fillStyle = '#B76E79'; ctx.font = '16px Segoe UI, sans-serif';
    ctx.fillText(`Matched by ${personaName} ${personaEmoji}`, 210, 250);
    // Watermark
    ctx.fillStyle = '#C9A96E'; ctx.font = 'bold 14px Segoe UI, sans-serif';
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
    <div style={{minHeight:"100vh",background:"#2C2C2E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>✨</div><div style={{color:"#C9A96E",fontSize:16,fontWeight:600}}>{t.loading}</div></div>
    </div>
  );

  if (!record) return (
    <div style={{minHeight:"100vh",background:"#2C2C2E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{textAlign:"center",padding:32,maxWidth:360}}>
        <div style={{fontSize:48,marginBottom:12}}>😢</div>
        <div style={{color:"#dc2626",marginBottom:8,fontWeight:600}}>{t.noResults}</div>
        <div style={{color:"#888",fontSize:13,marginBottom:16}}>{t.scanFirst}</div>
        <button onClick={()=>navigate('/ColorScanner')} style={{background:"#C9A96E",color:"#1C1C1E",border:"none",borderRadius:14,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.scanAgain}</button>
      </div>
    </div>
  );

  const adviceParagraphs = formatAdvice(record.claudeAdvice);
  const personaName = record.personaName || "Maya";
  const personaEmoji = record.personaEmoji || "💄";
  const allProducts = [...products, ...bonusProducts];

  return (
    <div style={{minHeight:"100vh",background:"#1C1C1E",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:"#2C2C2E",padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:560,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>navigate('/ColorScanner')} style={{background:"none",border:"1px solid #555",borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#F5F0E8",fontWeight:600}}>{t.scanAgain}</button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>💄</span>
            <span style={{fontWeight:800,fontSize:16,background:"#C9A96E",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MatchMyMakeup<span style={{fontSize:8}}>{'\u2122'}</span></span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px 60px"}}>
        {/* Scanned color */}
        <div style={{background:"#2C2C2E",borderRadius:20,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:20}}>
          <div style={{fontSize:11,color:"#aaa",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>{t.yourColor}</div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:record.scannedHex,flexShrink:0,boxShadow:`0 6px 24px ${record.scannedHex}80`}} />
            <div>
              <div style={{fontSize:28,fontWeight:700,color:"#C9A96E",letterSpacing:0.5,marginBottom:4}}>{getColourName(record.scannedRed, record.scannedGreen, record.scannedBlue)}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <div style={{fontFamily:"monospace",fontSize:20,fontWeight:800,color:"#F5F0E8"}}>{record.scannedHex}</div>
                <div style={{color:"#F5F0E8",fontSize:12}}>R <b style={{color:"#ef4444"}}>{record.scannedRed}</b> &nbsp; G <b style={{color:"#22c55e"}}>{record.scannedGreen}</b> &nbsp; B <b style={{color:"#3b82f6"}}>{record.scannedBlue}</b></div>
              </div>
              {(record.skinTone||record.occasion||record.country) && (
                <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                  {record.skinTone && <span style={{background:"#2C2C2E",color:"#B76E79",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{record.skinTone}</span>}
                  {record.occasion && <span style={{background:"#2C2C2E",color:"#C9A96E",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{record.occasion}</span>}
                  {record.country && <span style={{background:"#ecfdf5",color:"#065f46",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{COUNTRIES_LABELS[record.country]||record.country}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Persona advice */}
        <div style={{background:"#2C2C2E",border:"1px solid #C9A96E",borderRadius:20,padding:20,marginBottom:20,boxShadow:"0 4px 20px rgba(157,23,77,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"#C9A96E",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{personaEmoji}</div>
            <div>
              <div style={{fontWeight:800,fontSize:15,color:"#B76E79"}}>{personaName}'s {t.adviceTitle}</div>
              <div style={{fontSize:11,color:"#aaa"}}>{t.consultant}</div>
            </div>
          </div>
          {adviceParagraphs.length > 0 ? (
            <div style={{fontSize:14,lineHeight:1.8,color:"#F5F0E8"}}>
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
          <button onClick={()=>navigate('/Profile')} style={{background:"none",border:"1px solid #e5e7eb",borderRadius:20,padding:"8px 20px",cursor:"pointer",fontSize:12,color:"#C9A96E",fontWeight:600}}>
            🧬 Complete Your Beauty DNA Profile
          </button>
        </div>

        {/* Share + Save buttons */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={generateShareCard} style={{background:"#2C2C2E",border:"1px solid #e5e7eb",borderRadius:20,padding:"10px 20px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#C9A96E",minHeight:44}}>
            📤 Share My Match
          </button>
          <button onClick={()=>setShowSaveShade(true)} style={{background:"#2C2C2E",border:"1px solid #e5e7eb",borderRadius:20,padding:"10px 20px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#B76E79",minHeight:44}}>
            💾 Save This Color
          </button>
        </div>

        {/* Reverse trial / upsell */}
        {!upsellDismissed && (
          <div style={{position:"relative",background:"#2C2C2E",border:"1px solid #C9A96E",borderRadius:20,padding:"18px 44px 18px 18px",marginBottom:20}}>
            <button onClick={()=>setUpsellDismissed(true)} style={{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#C9A96E",padding:"2px 6px"}}>✕</button>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{fontSize:28,flexShrink:0,marginTop:2}}>✨</div>
              <div style={{flex:1}}>
                {!trialInfo.started ? (
                  <>
                    <div style={{fontWeight:800,fontSize:14,color:"#F5F0E8",marginBottom:4}}>{t.upsellHeading}</div>
                    <div style={{fontSize:12,color:"#999",lineHeight:1.5,marginBottom:12}}>{t.upsellSub}</div>
                    <button onClick={handleCheckout} style={{display:"inline-block",background:"#C9A96E",color:"#1C1C1E",borderRadius:12,padding:"9px 18px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>
                      Try Premium Free — 7 days, no card needed →
                    </button>
                  </>
                ) : trialInfo.active ? (
                  <>
                    <div style={{fontWeight:800,fontSize:14,color:"#C9A96E",marginBottom:4}}>🎉 Premium Trial Active</div>
                    <div style={{fontSize:12,color:"#999",lineHeight:1.5,marginBottom:4}}>{trialInfo.daysLeft} day{trialInfo.daysLeft!==1?'s':''} left in your free trial</div>
                    <div style={{fontSize:11,color:"#aaa"}}>Matching against 500+ products from 100+ brands</div>
                  </>
                ) : (
                  <>
                    <div style={{fontWeight:800,fontSize:14,color:"#F5F0E8",marginBottom:4}}>Your trial ended</div>
                    <div style={{fontSize:12,color:"#999",lineHeight:1.5,marginBottom:12}}>Maya saved {trialInfo.scansSaved} scan{trialInfo.scansSaved!==1?'s':''} for you — keep access for $4.99/month</div>
                    <button onClick={handleCheckout} style={{display:"inline-block",background:"#C9A96E",color:"#1C1C1E",borderRadius:12,padding:"9px 18px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>
                      Upgrade to Premium — $4.99/month →
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {allProducts.length > 0 && (
          <div>
            <div style={{fontWeight:800,fontSize:16,color:"#F5F0E8",marginBottom:12}}>🎯 {allProducts.length} {t.matchingProducts}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {allProducts.map((p,i) => (
                <div key={p.id||i} style={{background:"#2C2C2E",borderRadius:16,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column",position:"relative"}}>
                  {i >= products.length && <div style={{position:"absolute",top:0,left:0,right:0,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:"#1C1C1E",textAlign:"center",fontSize:9,fontWeight:700,padding:"3px 0",letterSpacing:0.5,textTransform:"uppercase"}}>Bonus Match</div>}
                  <div style={{height:80,background:p.hexCode||"#2C2C2E",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",marginTop:i>=products.length?18:0}}>
                    <div style={{width:52,height:52,borderRadius:"50%",backgroundColor:p.hexCode||"#e9d5ff",border:"3px solid rgba(255,255,255,0.6)",flexShrink:0}} />
                    <div style={{position:"absolute",top:6,left:6,background:i===0?"linear-gradient(135deg,#f59e0b,#ef4444)":"rgba(0,0,0,0.5)",color:i===0?"#1C1C1E":"#F5F0E8",borderRadius:8,padding:"2px 7px",fontSize:10,fontWeight:700}}>
                      {i===0?t.bestMatch:`#${i+1}`}
                    </div>
                  </div>
                  <div style={{padding:"10px 10px 12px",flex:1,display:"flex",flexDirection:"column"}}>
                    <div style={{fontSize:10,color:"#B76E79",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{p.brand}</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#F5F0E8",lineHeight:1.3,marginBottom:3,flex:1}}>{p.name}</div>
                    <div style={{fontSize:11,color:"rgba(201,169,110,0.7)",marginBottom:4}}>{p.colorName && <span>{p.colorName} · </span>}<span style={{textTransform:"capitalize"}}>{p.category}</span></div>
                    {p.price && <div style={{fontSize:13,fontWeight:700,color:"#C9A96E",marginBottom:6}}>{p.currency||"$"}{p.price}</div>}
                    <div style={{fontSize:10,color:"rgba(201,169,110,0.7)",marginBottom:8}}>{t.colorDistance}: <b style={{color:"#F5F0E8"}}>{p.colorDistance}</b></div>
                    <div style={{display:"flex",gap:4}}>
                      <a href={getShopUrl(p)} target="_blank" rel="noopener noreferrer" style={{flex:1,textAlign:"center",background:"#C9A96E",color:"#1C1C1E",borderRadius:10,padding:"7px 0",fontSize:11,fontWeight:700,textDecoration:"none",minHeight:32,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {p.retailerUrl && p.retailerUrl.startsWith('http') ? t.shopNow : 'Search Online →'}
                      </a>
                      <button onClick={()=>saveProductToLibrary(p)} style={{background:savedProductIds.has(p.name+p.brand)?"#ecfdf5":"#f9fafb",border:savedProductIds.has(p.name+p.brand)?"1px solid #86efac":"1px solid #e5e7eb",borderRadius:10,padding:"4px 8px",cursor:"pointer",fontSize:10,fontWeight:700,color:savedProductIds.has(p.name+p.brand)?"#16a34a":"#888",minHeight:32,whiteSpace:"nowrap"}}>
                        {justSaved===(p.name+p.brand) ? 'Saved! ✓' : savedProductIds.has(p.name+p.brand) ? 'Saved ✓' : '🔖 Save'}
                      </button>
                    </div>
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
          <div style={{position:"relative",background:"#2C2C2E",borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:560,maxHeight:"85vh",overflowY:"auto",WebkitOverflowScrolling:"touch",boxShadow:"0 -8px 40px rgba(0,0,0,0.15)"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
            <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:"#F5F0E8",textAlign:"center"}}>What's your skin tone?</h3>
            <p style={{margin:"0 0 16px",fontSize:12,color:"#888",textAlign:"center"}}>This helps {personaName} find better matches for you</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {SKIN_TONES.map(st => (
                <button key={st.id} onClick={()=>handleSkinToneSelect(st.id)} style={{padding:"14px 8px",borderRadius:16,border:"2px solid #444",background:"#2C2C2E",cursor:"pointer",fontSize:14,fontWeight:600,color:"#F5F0E8",textAlign:"center",minHeight:44}}>
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
          <div style={{position:"relative",background:"#2C2C2E",borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:560,maxHeight:"85vh",overflowY:"auto",WebkitOverflowScrolling:"touch",boxShadow:"0 -8px 40px rgba(0,0,0,0.15)"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
            <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:"#F5F0E8",textAlign:"center"}}>What's your age range?</h3>
            <p style={{margin:"0 0 16px",fontSize:12,color:"#888",textAlign:"center"}}>{personaName} will personalise advice for your age group</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {AGE_RANGES.map(age => (
                <button key={age} onClick={()=>handleAgeSelect(age)} style={{padding:"14px 18px",borderRadius:14,border:"2px solid #444",background:"#2C2C2E",cursor:"pointer",fontSize:15,fontWeight:600,color:"#F5F0E8",textAlign:"left",minHeight:44}}>
                  {age}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save shade modal */}
      {showSaveShade && record && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={()=>setShowSaveShade(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)"}} />
          <div style={{position:"relative",background:"#2C2C2E",borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:560}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
            <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,textAlign:"center",color:"#F5F0E8"}}>Save This Color</h3>
            <div style={{width:"100%",height:48,borderRadius:12,background:record.scannedHex,marginBottom:12}} />
            <div style={{textAlign:"center",fontFamily:"monospace",fontSize:16,fontWeight:700,color:"#F5F0E8",marginBottom:16}}>{record.scannedHex}</div>
            <input placeholder='e.g. "My everyday lip"' value={shadeName} onChange={e=>setShadeName(e.target.value)} style={{width:"100%",padding:"12px 14px",borderRadius:12,border:"1px solid #555",fontSize:14,marginBottom:12,background:"#3C3C3E",color:"#F5F0E8"}} />
            <button onClick={handleSaveShade} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"#C9A96E",color:"#1C1C1E",fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Save to My Shades</button>
          </div>
        </div>
      )}
    </div>
  );
}
