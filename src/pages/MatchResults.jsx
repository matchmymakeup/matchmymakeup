import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getColourName } from "../utils/colourNames.js";
import { getProfile, saveProfile, getSavedProducts, saveProduct, getSavedShades, saveShade } from "../lib/storage";
import { getTrialInfo, startTrial } from "../lib/trial";
import PageBackBar from "../components/PageBackBar";
import Dropdown from "../components/Dropdown";
import { BG_WHITE, BG_OFFWHITE, INK_PRIMARY, INK_SECONDARY, ACCENT_BLACK, HAIRLINE, BORDER_ACTIVE, SHADOW } from "../lib/design-tokens";

const SERIF = "'DM Serif Display', Georgia, serif";

// PR5 — Shop In dropdown options match ColorScanner. Inlined here vs
// importing because ColorScanner exports nothing and centralisation is
// banked polish-pass work.
const SHOP_IN_OPTIONS = [
  { value: '',              label: 'Global',       icon: '🌍' },
  { value: 'USA',           label: 'USA',          icon: '🇺🇸' },
  { value: 'India',         label: 'India',        icon: '🇮🇳' },
  { value: 'Brazil',        label: 'Brazil',       icon: '🇧🇷' },
  { value: 'China',         label: 'China',        icon: '🇨🇳' },
  { value: 'Indonesia',     label: 'Indonesia',    icon: '🇮🇩' },
  { value: 'Nigeria',       label: 'Nigeria',      icon: '🇳🇬' },
  { value: 'Australia',     label: 'Australia',    icon: '🇦🇺' },
  { value: 'Philippines',   label: 'Philippines',  icon: '🇵🇭' },
  { value: 'South Africa',  label: 'South Africa', icon: '🇿🇦' },
];

const T = {
  en: { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a color first.", scanAgain:"← Scan Another", yourColor:"Your Scanned Color", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again for fresh recommendations! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Color distance", shopNow:"Shop Now →", upsellHeading:"Seeing only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands including Charlotte Tilbury, NARS, Rare Beauty, Colorkey and more.", upsellBtn:"Upgrade to Premium — $4.99/month →", revealMomentMeasured:"Here's what we measured.", personaRevealFrame:"Here's what your colour tells me about you.", specificityBridge:"{personaName} chose these products with your colour in mind.", upsellEmotionalGrounding:"{personaName} found {matchCount} matches that fit you. Premium opens up the full library." },
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
  tl: { loading:"Nilo-load ang iyong mga resulta...", noResults:"Walang nahanap na resulta", scanFirst:"Mag-scan muna ng kulay.", scanAgain:"← Mag-scan ulit", yourColor:"Iyong Na-scan na Kulay", adviceTitle:"Beauty Advice", consultant:"Ang iyong personal na beauty consultant", noAdvice:"Subukan mag-scan ulit! ✨", matchingProducts:"Mga Tugmang Produkto", bestMatch:"⭐ Pinakamahusay", colorDistance:"Distansya ng kulay", shopNow:"Bumili Ngayon →", upsellHeading:"10 matches lang ang nakikita mula sa 50 produkto?", upsellSub:"Ang Premium members ay nagma-match sa 500+ produkto mula sa 100+ brands.", upsellBtn:"Mag-upgrade sa Premium — $4.99/buwan →" },
  'en-za': { loading:"Loading your results...", noResults:"No results found", scanFirst:"Please scan a colour first.", scanAgain:"← Scan Another", yourColor:"Your Scanned Colour", adviceTitle:"Beauty Advice", consultant:"Your personal beauty consultant", noAdvice:"Try scanning again for fresh recommendations! ✨", matchingProducts:"Matching Products", bestMatch:"⭐ Best", colorDistance:"Colour distance", shopNow:"Shop Now →", upsellHeading:"Seeing only 10 matches from 50 products?", upsellSub:"Premium members match against 500+ products from 100+ brands.", upsellBtn:"Upgrade to Premium — R89/month →" },
  af: { loading:"Laai tans jou resultate...", noResults:"Geen resultate gevind nie", scanFirst:"Skandeer eers 'n kleur.", scanAgain:"← Skandeer weer", yourColor:"Jou Geskandeerde Kleur", adviceTitle:"Skoonheidsraad", consultant:"Jou persoonlike skoonheidskonsultant", noAdvice:"Probeer weer skandeer! ✨", matchingProducts:"Passende Produkte", bestMatch:"⭐ Beste", colorDistance:"Kleurafstand", shopNow:"Koop Nou →", upsellHeading:"Sien net 10 passings uit 50 produkte?", upsellSub:"Premium-lede pas teen 500+ produkte van 100+ handelsmerke.", upsellBtn:"Gradeer op na Premium — R89/maand →" },
  zu: { loading:"Ilayisha imiphumela yakho...", noResults:"Ayikho imiphumela etholakele", scanFirst:"Sicela uskene umbala kuqala.", scanAgain:"← Skena okunye", yourColor:"Umbala Wakho Oskenwe", adviceTitle:"Iseluleko Sobuhle", consultant:"Umeluleki wakho wobuhle", noAdvice:"Zama ukuskena futhi! ✨", matchingProducts:"Imikhiqizo Efanayo", bestMatch:"⭐ Engcono", colorDistance:"Ibanga lombala", shopNow:"Thenga Manje →", upsellHeading:"Ubona ama-match angu-10 kuphela kwimikhiqizo engu-50?", upsellSub:"Amalungu e-Premium afanisa nemikhiqizo engu-500+ yama-brand angu-100+.", upsellBtn:"Thuthukisela ku-Premium — R89/inyanga →" },
};

const COUNTRIES_LABELS = { USA:"🇺🇸 USA", Australia:"🇦🇺 Australia", India:"🇮🇳 India", Brazil:"🇧🇷 Brazil", Indonesia:"🇮🇩 Indonesia", Nigeria:"🇳🇬 Nigeria", China:"🇨🇳 China", "Latin America":"🇲🇽 Latin America", "Middle East":"🇸🇦 Middle East", France:"🇫🇷 France", Bangladesh:"🇧🇩 Bangladesh", "East Africa":"🇰🇪 East Africa" };

function formatAdvice(text) {
  if (!text) return [];
  return text.replace(/#{1,3}\s*/g,"").replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/---+/g,"").split(/\n\n+/).map(p=>p.trim()).filter(p=>p.length>0);
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
  const [trialInfo, setTrialInfo] = useState(getTrialInfo());
  const shareCanvasRef = useRef(null);
  const [showSaveShade, setShowSaveShade] = useState(false);
  const [savedProductIds, setSavedProductIds] = useState(new Set());
  const [justSaved, setJustSaved] = useState(null);
  const [savedThisSession, setSavedThisSession] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareCopied, setShareCopied] = useState(null);
  const [shadeName, setShadeName] = useState('');

  // PR5 — country re-query state. originalCountry is locked at mount
  // from record.country and used for the stale-advice note copy.
  // staleAdvice flips true when user changes the Shop In dropdown
  // (products refresh in place but advice text is from original country
  // until Match Again re-fetches /api/advice).
  const [originalCountry, setOriginalCountry] = useState('');
  const [staleAdvice, setStaleAdvice] = useState(false);
  const [rematchLoading, setRematchLoading] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState(false);

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mmm_profile') || '{}') } catch { return {} }
  });
  const scanCount = getScanCount();
  const showSkinToneBanner = !profile.skin_tone && !skinToneBannerDismissed;
  const showAgeBanner = scanCount >= 2 && !profile.age_range && profile.skin_tone && !ageBannerDismissed;

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
      setOriginalCountry(data.country || '');
      let prods = [];
      if (Array.isArray(data.matchedProducts)) prods = data.matchedProducts;
      else if (typeof data.matchedProducts === "string") { try { prods = JSON.parse(data.matchedProducts); } catch { prods = []; } }
      setProducts(prods);
    } catch(err) { console.error("[MatchResults] parse error:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true
    getProfile().then(p => { if (active) setProfile(p) })
    getSavedProducts().then(products => {
      if (active) setSavedProductIds(new Set(products.map(p => `${p.name}|${p.brand}`)))
    })
    return () => { active = false }
  }, [])

  // Reset on color change — MatchResults stays mounted across some scan
  // flows; without this, savedThisSession leaks from a previous match.
  useEffect(() => {
    setSavedThisSession(false)
  }, [record?.scannedHex])

  async function handleSkinToneSelect(tone) {
    saveProfile({ skin_tone: tone });
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
    saveProfile({ age_range: age });
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

  async function handleSaveShade() {
    if (!shadeName || !record) return;
    try {
      await saveShade({ name: shadeName, hex: record.scannedHex });
      setSavedThisSession(true);
    } catch (err) {
      console.error('[MatchResults] saveShade failed:', err);
    }
    setShadeName(''); setShowSaveShade(false);
  }

  async function saveProductToLibrary(p) {
    const key = `${p.name}|${p.brand}`;
    if (savedProductIds.has(key)) return;
    setSavedProductIds(prev => new Set([...prev, key]));
    setJustSaved(key);
    setTimeout(() => setJustSaved(null), 2000);
    try {
      await saveProduct({
        name: p.name,
        brand: p.brand,
        category: p.category,
        hex: p.hexCode,
        shade: p.colorName,
        price: p.price,
        currency: p.currency,
      });
      setSavedThisSession(true);
    } catch (err) {
      console.error('[MatchResults] saveProduct failed:', err);
      setSavedProductIds(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      });
    }
  }

  const SHARE_PLATFORMS = {
    whatsapp: { label: 'WhatsApp', icon: '💬' },
    instagram: { label: 'Instagram', icon: '📸' },
    telegram: { label: 'Telegram', icon: '✈️' },
    facebook: { label: 'Facebook', icon: '👍' },
    messenger: { label: 'Messenger', icon: '💭' },
    wechat: { label: 'WeChat', icon: '🟢' },
    weibo: { label: 'Weibo', icon: '🔴' },
    qq: { label: 'QQ', icon: '🐧' },
    douyin: { label: 'Douyin', icon: '🎵' },
    xiaohongshu: { label: '小红书', icon: '📕' },
    tiktok: { label: 'TikTok', icon: '🎵' },
    snapchat: { label: 'Snapchat', icon: '👻' },
    pinterest: { label: 'Pinterest', icon: '📌' },
    sms: { label: 'SMS', icon: '💬' },
    line: { label: 'Line', icon: '💚' },
    viber: { label: 'Viber', icon: '💜' },
    sharechat: { label: 'ShareChat', icon: '💛' },
    youtube: { label: 'YouTube', icon: '▶️' },
    copy: { label: 'Copy Link', icon: '🔗' },
  };

  const COUNTRY_SHARE_MAP = {
    India: ['whatsapp','instagram','telegram','facebook','youtube','sharechat','copy'],
    Indonesia: ['whatsapp','instagram','line','tiktok','facebook','telegram','copy'],
    Brazil: ['whatsapp','instagram','tiktok','facebook','telegram','copy'],
    Nigeria: ['whatsapp','instagram','facebook','telegram','tiktok','copy'],
    Philippines: ['facebook','messenger','viber','whatsapp','instagram','tiktok','copy'],
    'South Africa': ['whatsapp','instagram','facebook','telegram','tiktok','copy'],
    China: ['wechat','weibo','qq','douyin','xiaohongshu','copy'],
    USA: ['instagram','tiktok','snapchat','pinterest','sms','whatsapp','copy'],
    Australia: ['instagram','whatsapp','tiktok','facebook','sms','copy'],
  };

  function getSharePlatforms() {
    const userCountry = profile.country || record?.country || '';
    const platforms = [...(COUNTRY_SHARE_MAP[userCountry] || ['whatsapp','instagram','telegram','facebook','tiktok','copy'])];
    if (!platforms.includes('copy')) platforms.push('copy');
    if (profile.share_preference && platforms.includes(profile.share_preference)) {
      const idx = platforms.indexOf(profile.share_preference);
      if (idx > 0) { platforms.splice(idx, 1); platforms.unshift(profile.share_preference); }
    }
    return platforms;
  }

  function handleSharePlatform(platform) {
    const hex = record?.scannedHex || '';
    const shareText = `I found my perfect makeup match! ${hex} via MatchMyMakeup 💄 matchmymakeup.ai`;
    const shareUrl = 'https://matchmymakeup.ai';
    const encoded = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const copyAndNotify = (key, text) => {
      navigator.clipboard?.writeText(text || shareText).then(() => { setShareCopied(key); setTimeout(() => setShareCopied(null), 2500); });
    };
    switch (platform) {
      case 'whatsapp': window.open(`https://wa.me/?text=${encoded}`, '_blank'); break;
      case 'telegram': window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encoded}`, '_blank'); break;
      case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank'); break;
      case 'messenger': window.open(`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518`, '_blank'); break;
      case 'sms': window.open(`sms:?body=${encoded}`, '_self'); break;
      case 'viber': window.open(`viber://forward?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_self'); break;
      case 'line': window.open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`, '_blank'); break;
      case 'snapchat': window.open(`https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}`, '_blank'); break;
      case 'pinterest': window.open(`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encoded}`, '_blank'); break;
      case 'qq': window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}`, '_blank'); break;
      case 'weibo': window.open(`https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encoded}`, '_blank'); break;
      case 'instagram': copyAndNotify('instagram'); window.open('https://www.instagram.com/', '_blank'); break;
      case 'youtube': copyAndNotify('youtube'); window.open('https://www.youtube.com/', '_blank'); break;
      case 'wechat': copyAndNotify('wechat'); break;
      case 'tiktok': copyAndNotify('tiktok'); break;
      case 'douyin': copyAndNotify('douyin'); break;
      case 'xiaohongshu': copyAndNotify('xiaohongshu'); break;
      case 'sharechat': copyAndNotify('sharechat'); window.open('https://sharechat.com/', '_blank'); break;
      case 'copy': copyAndNotify('copy', shareUrl); break;
    }
  }

  function getShopUrl(p) {
    if (p.retailerUrl && p.retailerUrl.startsWith('http') && !p.retailerUrl.includes('google.com/search')) return p.retailerUrl;
    const q = encodeURIComponent(p.brand + ' ' + p.name);
    const userCountry = record?.country || '';
    switch (userCountry) {
      case 'USA': case 'Australia': return `https://www.sephora.com/search?keyword=${q}`;
      case 'India': return `https://www.nykaa.com/search/result/?q=${q}`;
      case 'Indonesia': return `https://shopee.co.id/search?keyword=${q}`;
      case 'Philippines': return `https://shopee.ph/search?keyword=${q}`;
      case 'Nigeria': return `https://www.jumia.com.ng/catalog/?q=${q}`;
      case 'South Africa': return `https://www.takealot.com/all?qsearch=${q}`;
      case 'China': return `https://s.taobao.com/search?q=${q}`;
      case 'Brazil': return `https://www.amazon.com.br/s?k=${q}`;
      default: return `https://www.google.com/search?q=${encodeURIComponent(p.brand + ' ' + p.name + ' buy online')}`;
    }
  }

  // Share card canvas is downloaded media (PNG export to social), not in-app
  // chrome. Retains pre-PR-A.2 dark-chrome aesthetic intentionally. Forward
  // polish-pass to migrate to monochrome consistent with the in-app surface.
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
    <div style={{minHeight:"100vh",background:BG_OFFWHITE,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>✨</div><div style={{color:INK_PRIMARY,fontSize:16,fontWeight:600}}>{t.loading}</div></div>
    </div>
  );

  if (!record) return (
    <div style={{minHeight:"100vh",background:BG_OFFWHITE,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{textAlign:"center",padding:32,maxWidth:360}}>
        <div style={{fontSize:48,marginBottom:12}}>😢</div>
        <div style={{color:"#dc2626",marginBottom:8,fontWeight:600}}>{t.noResults}</div>
        <div style={{color:"#888",fontSize:13,marginBottom:16}}>{t.scanFirst}</div>
        <button onClick={()=>navigate('/ColorScanner')} style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:14,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.scanAgain}</button>
      </div>
    </div>
  );

  const adviceParagraphs = formatAdvice(record.claudeAdvice);
  const personaName = record.personaName || "Maya";
  const personaEmoji = record.personaEmoji || "💄";
  const allProducts = [...products, ...bonusProducts];
  const matchCount = allProducts.length;

  // PR5 — country dropdown change triggers in-place /api/match re-run.
  // Advice text stays from original scan; user clicks Match Again to
  // refresh advice for the new country.
  async function handleCountryChange(newCountry) {
    if (!record) return;
    try { sessionStorage.setItem('mmm_country', newCountry); } catch {}
    setRecord({ ...record, country: newCountry });
    setStaleAdvice(newCountry !== originalCountry);
    if (newCountry === originalCountry) return; // back to original — no re-fetch needed
    setRematchLoading(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          r: record.scannedRed, g: record.scannedGreen, b: record.scannedBlue,
          country: newCountry, category: record.category
        })
      });
      const data = await res.json();
      if (data.matches) {
        setProducts(data.matches);
        setBonusProducts([]); // bonus products were tied to original country
      }
    } catch (err) { console.error('[MatchResults] country re-match failed:', err); }
    finally { setRematchLoading(false); }
  }

  async function handleMatchAgain() {
    if (!record || adviceLoading) return;
    setAdviceLoading(true);
    try {
      let userProfile = {};
      try { userProfile = JSON.parse(localStorage.getItem('mmm_profile') || '{}'); } catch {}
      const res = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          hex: record.scannedHex,
          r: record.scannedRed, g: record.scannedGreen, b: record.scannedBlue,
          skinTone: record.skinTone, occasion: record.occasion,
          country: record.country, category: record.category,
          profile: userProfile, lang: record.lang
        })
      });
      const data = await res.json();
      if (data.advice) {
        setRecord({ ...record, claudeAdvice: data.advice });
        setStaleAdvice(false);
      }
    } catch (err) { console.error('[MatchResults] match-again advice fetch failed:', err); }
    finally { setAdviceLoading(false); }
  }

  return (
    <div style={{minHeight:"100vh",background:BG_WHITE,fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px 60px"}}>
        <PageBackBar onBack={() => navigate('/ColorScanner')} label={t.scanAgain} title="Your Match" />

        {/* PR5 — Shop In country dropdown. Change triggers in-place
            /api/match re-run; advice stays from original until user taps
            Match Again.

            MatchResults migrated to monochrome chrome per PR-A.2 — Artefact 2
            §7.2 + Charter-application override of Artefact 6 §5.4 (Saturday
            Desiree-review release-gate constraint). Chromatic content (scanned
            colours, classification badges, season swatches) preserved per §7.2
            carve-out. */}
        <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:8,marginBottom:14}}>
          <span style={{fontSize:11,color:'#aaa',fontWeight:600,letterSpacing:1,textTransform:'uppercase'}}>Shop In</span>
          <Dropdown
            value={record.country || ''}
            options={SHOP_IN_OPTIONS}
            onChange={handleCountryChange}
            placeholder="Global"
            disabled={rematchLoading}
          />
        </div>
        {rematchLoading && (
          <div style={{textAlign:'center',color:INK_SECONDARY,fontSize:12,fontWeight:600,marginBottom:10}}>
            🔍 Re-scanning products in {record.country || 'Global'}…
          </div>
        )}

        {/* Wordmark — preserved verbatim from original chrome bar; MatchResults is the highest-share page so the wordmark drives outbound brand exposure */}
        {/* fontSize:8 trademark trick — visually intentional, not a typo */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:20}}>
          <span style={{fontSize:20}}>💄</span>
          <span style={{fontWeight:800,fontSize:16,color:INK_PRIMARY}}>MatchMyMakeup<span style={{fontSize:8}}>{'™'}</span></span>
        </div>

        {/* Moment 1 — reveal frame label opening the result sequence (CIT §3.2 element 2) */}
        <div style={{fontSize:11,fontWeight:600,color:INK_SECONDARY,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8}}>
          {t.revealMomentMeasured ?? T.en.revealMomentMeasured}
        </div>

        {/* Scanned color */}
        <div style={{background:BG_OFFWHITE,borderRadius:20,padding:20,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:20}}>
          <div style={{fontSize:11,color:"#aaa",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>{t.yourColor}</div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:record.scannedHex,flexShrink:0,boxShadow:`0 6px 24px ${record.scannedHex}80`}} />
            <div>
              <div style={{fontSize:28,fontWeight:700,color:INK_PRIMARY,letterSpacing:0.5,marginBottom:4}}>{getColourName(record.scannedRed, record.scannedGreen, record.scannedBlue)}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <div style={{fontFamily:"monospace",fontSize:20,fontWeight:800,color:INK_PRIMARY}}>{record.scannedHex}</div>
                <div style={{color:INK_PRIMARY,fontSize:12}}>R <b style={{color:"#ef4444"}}>{record.scannedRed}</b> &nbsp; G <b style={{color:"#22c55e"}}>{record.scannedGreen}</b> &nbsp; B <b style={{color:"#3b82f6"}}>{record.scannedBlue}</b></div>
              </div>
              {(record.skinTone||record.occasion||record.country) && (
                <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                  {record.skinTone && <span style={{background:BG_OFFWHITE,color:INK_PRIMARY,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{record.skinTone}</span>}
                  {record.occasion && <span style={{background:BG_OFFWHITE,color:INK_PRIMARY,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{record.occasion}</span>}
                  {record.country && <span style={{background:"#ecfdf5",color:"#065f46",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{COUNTRIES_LABELS[record.country]||record.country}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Persona advice */}
        <div style={{background:BG_OFFWHITE,border:`1px solid ${HAIRLINE}`,borderRadius:20,padding:20,marginBottom:20,boxShadow:SHADOW}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:ACCENT_BLACK,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{personaEmoji}</div>
            <div>
              <div style={{fontWeight:800,fontSize:15,color:INK_PRIMARY}}>{personaName}'s {t.adviceTitle}</div>
              <div style={{fontSize:11,color:"#aaa"}}>{t.consultant}</div>
            </div>
          </div>
          {/* Moment 2 — persona reveal frame line (CIT §3.2 element 3) */}
          <div style={{fontStyle:'italic',color:INK_SECONDARY,fontSize:13,marginBottom:10}}>
            {t.personaRevealFrame ?? T.en.personaRevealFrame}
          </div>
          {adviceParagraphs.length > 0 ? (
            <div style={{fontSize:14,lineHeight:1.8,color:INK_PRIMARY}}>
              {adviceParagraphs.map((para,i) => <p key={i} style={{margin:"0 0 10px 0"}}>{para}</p>)}
            </div>
          ) : <p style={{color:"#aaa",fontSize:14,margin:0}}>{t.noAdvice}</p>}

          {/* PR5 — stale-advice note + Match Again button (only when user
              changed the Shop In dropdown to a country other than the
              original scan's country). */}
          {staleAdvice && record.country !== originalCountry && (
            <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${HAIRLINE}`}}>
              <div style={{fontStyle:'italic',fontSize:12,color:'#aaa',lineHeight:1.5,marginBottom:8}}>
                Advice based on your original {originalCountry || 'Global'} scan.
                Tap Match Again for fresh advice in {record.country || 'Global'}.
              </div>
              <button
                onClick={handleMatchAgain}
                disabled={adviceLoading}
                style={{
                  background: adviceLoading ? '#3C3C3E' : ACCENT_BLACK,
                  color: adviceLoading ? '#aaa' : BG_WHITE,
                  border: 'none',
                  borderRadius: 999,
                  padding: '8px 18px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: adviceLoading ? 'default' : 'pointer',
                  fontFamily: "'Segoe UI',sans-serif",
                }}
              >
                {adviceLoading ? '✨ Refreshing advice…' : '✨ Match Again'}
              </button>
            </div>
          )}
        </div>

        {/* Progressive: Skin tone banner (after 1st scan) */}
        {showSkinToneBanner && (
          <div style={{position:"relative",background:BG_OFFWHITE,border:`1px solid ${HAIRLINE}`,borderRadius:16,padding:"14px 40px 14px 14px",marginBottom:16,cursor:"pointer"}} onClick={()=>setShowSkinToneSheet(true)}>
            <button onClick={e=>{e.stopPropagation();setSkinToneBannerDismissed(true);}} style={{position:"absolute",top:8,right:8,background:"none",border:"none",cursor:"pointer",fontSize:14,color:INK_SECONDARY,padding:"2px 6px"}}>✕</button>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>✨</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:INK_PRIMARY}}>{personaName} found {products.length} matches. Tell us your skin tone and unlock 5 more →</div>
              </div>
            </div>
          </div>
        )}

        {/* Progressive: Age range banner (after 2nd scan) */}
        {showAgeBanner && (
          <div style={{position:"relative",background:BG_OFFWHITE,border:`1px solid ${HAIRLINE}`,borderRadius:16,padding:"14px 40px 14px 14px",marginBottom:16,cursor:"pointer"}} onClick={()=>setShowAgeSheet(true)}>
            <button onClick={e=>{e.stopPropagation();setAgeBannerDismissed(true);}} style={{position:"absolute",top:8,right:8,background:"none",border:"none",cursor:"pointer",fontSize:14,color:INK_SECONDARY,padding:"2px 6px"}}>✕</button>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>🎂</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:INK_PRIMARY}}>Add your age range and get personalised advice from {personaName} →</div>
              </div>
            </div>
          </div>
        )}

        {/* Profile link */}
        <div style={{textAlign:"center",marginBottom:16}}>
          <button onClick={()=>navigate('/Profile')} style={{background:"none",border:"1px solid #e5e7eb",borderRadius:20,padding:"8px 20px",cursor:"pointer",fontSize:12,color:INK_PRIMARY,fontWeight:600}}>
            🧬 Complete Your Beauty DNA Profile
          </button>
        </div>

        {/* Share + Save buttons */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={()=>setShowShareSheet(true)} style={{background:BG_OFFWHITE,border:"1px solid #e5e7eb",borderRadius:20,padding:"10px 20px",cursor:"pointer",fontSize:13,fontWeight:700,color:INK_PRIMARY,minHeight:44}}>
            📤 Share My Match →
          </button>
          <button onClick={()=>setShowSaveShade(true)} style={{background:BG_OFFWHITE,border:"1px solid #e5e7eb",borderRadius:20,padding:"10px 20px",cursor:"pointer",fontSize:13,fontWeight:700,color:INK_PRIMARY,minHeight:44}}>
            💾 Save This Color
          </button>
        </div>

        {/* Post-save affordance — session-scoped, NOT derived from storage. Set true on successful save in saveProductToLibrary or handleSaveShade; never resets in this session, never appears on revisit without a fresh save. */}
        {savedThisSession && (
          <div style={{textAlign:"center",marginBottom:16}}>
            <button onClick={()=>navigate('/Library')} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:INK_PRIMARY,fontWeight:700,padding:"4px 12px",fontFamily:"'Segoe UI',sans-serif"}}>
              ✓ Saved · View in Library →
            </button>
          </div>
        )}

        {/* Reverse trial / upsell */}
        {!upsellDismissed && (
          <div style={{position:"relative",background:BG_OFFWHITE,border:`1px solid ${HAIRLINE}`,borderRadius:20,padding:"18px 44px 18px 18px",marginBottom:20}}>
            <button onClick={()=>setUpsellDismissed(true)} style={{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",fontSize:16,color:INK_SECONDARY,padding:"2px 6px"}}>✕</button>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{fontSize:28,flexShrink:0,marginTop:2}}>✨</div>
              <div style={{flex:1}}>
                {!trialInfo.started ? (
                  <>
                    {/* Moment 4 — emotional grounding before commercial offer (CIT §3.2 element 5) */}
                    <div style={{fontWeight:800,fontSize:14,color:INK_PRIMARY,marginBottom:4}}>
                      {(t.upsellEmotionalGrounding ?? T.en.upsellEmotionalGrounding)
                        .replace('{personaName}', personaName)
                        .replace('{matchCount}', matchCount)}
                    </div>
                    <div style={{fontSize:12,color:"#999",lineHeight:1.5,marginBottom:12}}>{t.upsellSub}</div>
                    <button onClick={handleCheckout} style={{display:"inline-block",background:ACCENT_BLACK,color:BG_WHITE,borderRadius:12,padding:"9px 18px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>
                      Try Premium Free — 7 days, no card needed →
                    </button>
                  </>
                ) : trialInfo.active ? (
                  <>
                    <div style={{fontWeight:800,fontSize:14,color:INK_PRIMARY,marginBottom:4}}>🎉 Premium Trial Active</div>
                    <div style={{fontSize:12,color:"#999",lineHeight:1.5,marginBottom:4}}>{trialInfo.daysLeft} day{trialInfo.daysLeft!==1?'s':''} left in your free trial</div>
                    <div style={{fontSize:11,color:"#aaa"}}>Matching against 500+ products from 100+ brands</div>
                  </>
                ) : (
                  <>
                    <div style={{fontWeight:800,fontSize:14,color:INK_PRIMARY,marginBottom:4}}>Your trial ended</div>
                    <div style={{fontSize:12,color:"#999",lineHeight:1.5,marginBottom:12}}>Maya saved {trialInfo.scansSaved} scan{trialInfo.scansSaved!==1?'s':''} for you — keep access for $4.99/month</div>
                    <button onClick={handleCheckout} style={{display:"inline-block",background:ACCENT_BLACK,color:BG_WHITE,borderRadius:12,padding:"9px 18px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>
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
            {/* Moment 3 — specificity bridge (CIT §3.2 element 4) */}
            <div style={{fontFamily:SERIF,color:INK_PRIMARY,fontSize:16,fontWeight:400,lineHeight:1.4,marginBottom:16}}>
              {(t.specificityBridge ?? T.en.specificityBridge).replace('{personaName}', personaName)}
            </div>
            <div style={{fontWeight:800,fontSize:16,color:INK_PRIMARY,marginBottom:12}}>🎯 {allProducts.length} {t.matchingProducts}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {allProducts.map((p,i) => (
                <div key={p.id||i} style={{background:BG_OFFWHITE,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column",position:"relative"}}>
                  {i >= products.length && <div style={{position:"absolute",top:0,left:0,right:0,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:INK_PRIMARY,textAlign:"center",fontSize:9,fontWeight:700,padding:"3px 0",letterSpacing:0.5,textTransform:"uppercase"}}>Bonus Match</div>}
                  <div style={{height:80,background:p.hexCode||BG_OFFWHITE,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",marginTop:i>=products.length?18:0}}>
                    <div style={{width:52,height:52,borderRadius:"50%",backgroundColor:p.hexCode||"#e9d5ff",border:`3px solid ${HAIRLINE}`,flexShrink:0}} />
                    <div style={{position:"absolute",top:6,left:6,background:i===0?"linear-gradient(135deg,#f59e0b,#ef4444)":"rgba(255,255,255,0.6)",color:INK_PRIMARY,borderRadius:8,padding:"2px 7px",fontSize:10,fontWeight:700}}>
                      {i===0?t.bestMatch:`#${i+1}`}
                    </div>
                  </div>
                  <div style={{padding:"10px 10px 12px",flex:1,display:"flex",flexDirection:"column"}}>
                    <div style={{fontSize:10,color:INK_SECONDARY,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{p.brand}</div>
                    <div style={{fontSize:12,fontWeight:700,color:INK_PRIMARY,lineHeight:1.3,marginBottom:3,flex:1}}>{p.name}</div>
                    <div style={{fontSize:11,color:INK_SECONDARY,marginBottom:4}}>{p.colorName && <span>{p.colorName} · </span>}<span style={{textTransform:"capitalize"}}>{p.category}</span></div>
                    {p.price && <div style={{fontSize:13,fontWeight:700,color:INK_PRIMARY,marginBottom:6}}>{p.currency||"$"}{p.price}</div>}
                    <div style={{fontSize:10,color:INK_SECONDARY,marginBottom:8}}>{t.colorDistance}: <b style={{color:INK_PRIMARY}}>{p.colorDistance}</b></div>
                    <div style={{display:"flex",gap:4}}>
                      <a href={getShopUrl(p)} target="_blank" rel="noopener noreferrer" style={{flex:1,textAlign:"center",background:ACCENT_BLACK,color:BG_WHITE,borderRadius:10,padding:"7px 0",fontSize:11,fontWeight:700,textDecoration:"none",minHeight:32,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {p.retailerUrl && p.retailerUrl.startsWith('http') ? t.shopNow : 'Search Online →'}
                      </a>
                      <button onClick={()=>saveProductToLibrary(p)} style={{background:savedProductIds.has(`${p.name}|${p.brand}`)?"#ecfdf5":"#f9fafb",border:savedProductIds.has(`${p.name}|${p.brand}`)?"1px solid #86efac":"1px solid #e5e7eb",borderRadius:10,padding:"4px 8px",cursor:"pointer",fontSize:10,fontWeight:700,color:savedProductIds.has(`${p.name}|${p.brand}`)?"#16a34a":"#888",minHeight:32,whiteSpace:"nowrap"}}>
                        {justSaved===(`${p.name}|${p.brand}`) ? 'Saved! ✓' : savedProductIds.has(`${p.name}|${p.brand}`) ? 'Saved ✓' : '🔖 Save'}
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
          <div style={{position:"relative",background:BG_OFFWHITE,borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:560,maxHeight:"85vh",overflowY:"auto",WebkitOverflowScrolling:"touch",boxShadow:"0 -8px 40px rgba(0,0,0,0.15)"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
            <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:INK_PRIMARY,textAlign:"center"}}>What's your skin tone?</h3>
            <p style={{margin:"0 0 16px",fontSize:12,color:"#888",textAlign:"center"}}>This helps {personaName} find better matches for you</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {SKIN_TONES.map(st => (
                <button key={st.id} onClick={()=>handleSkinToneSelect(st.id)} style={{padding:"14px 8px",borderRadius:16,border:"2px solid #444",background:BG_OFFWHITE,cursor:"pointer",fontSize:14,fontWeight:600,color:INK_PRIMARY,textAlign:"center",minHeight:44}}>
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
          <div style={{position:"relative",background:BG_OFFWHITE,borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:560,maxHeight:"85vh",overflowY:"auto",WebkitOverflowScrolling:"touch",boxShadow:"0 -8px 40px rgba(0,0,0,0.15)"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
            <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:INK_PRIMARY,textAlign:"center"}}>What's your age range?</h3>
            <p style={{margin:"0 0 16px",fontSize:12,color:"#888",textAlign:"center"}}>{personaName} will personalise advice for your age group</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {AGE_RANGES.map(age => (
                <button key={age} onClick={()=>handleAgeSelect(age)} style={{padding:"14px 18px",borderRadius:14,border:"2px solid #444",background:BG_OFFWHITE,cursor:"pointer",fontSize:15,fontWeight:600,color:INK_PRIMARY,textAlign:"left",minHeight:44}}>
                  {age}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share sheet modal */}
      {showShareSheet && record && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={()=>setShowShareSheet(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)"}} />
          <div style={{position:"relative",background:BG_WHITE,borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:560,boxShadow:"0 -8px 40px rgba(0,0,0,0.3)"}}>
            <div style={{width:40,height:4,background:"#555",borderRadius:2,margin:"0 auto 16px"}} />
            <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800,color:INK_PRIMARY,textAlign:"center"}}>Share My Match</h3>
            <p style={{margin:"0 0 20px",fontSize:12,color:"#888",textAlign:"center"}}>Choose a platform to share your colour match</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {getSharePlatforms().map(key => {
                const p = SHARE_PLATFORMS[key];
                if (!p) return null;
                const isCopied = shareCopied === key;
                return (
                  <button key={key} onClick={()=>handleSharePlatform(key)} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderRadius:14,border:"1px solid #333",background:BG_OFFWHITE,cursor:"pointer",minHeight:48}}>
                    <span style={{fontSize:20}}>{p.icon}</span>
                    <span style={{fontSize:13,fontWeight:700,color:isCopied?"#16a34a":INK_PRIMARY}}>{isCopied?(key==='copy'?'Copied!':key==='xiaohongshu'?'Copied — paste in 小红书':'Copied — paste in '+p.label):p.label}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={()=>{generateShareCard();setShowShareSheet(false);}} style={{width:"100%",padding:"14px",borderRadius:14,border:`1px solid ${HAIRLINE}`,background:"transparent",color:INK_PRIMARY,fontSize:13,fontWeight:700,cursor:"pointer",minHeight:44}}>
              📥 Download Share Card
            </button>
          </div>
        </div>
      )}

      {/* Save shade modal */}
      {showSaveShade && record && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={()=>setShowSaveShade(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)"}} />
          <div style={{position:"relative",background:BG_OFFWHITE,borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:560}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
            <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,textAlign:"center",color:INK_PRIMARY}}>Save This Color</h3>
            <div style={{width:"100%",height:48,borderRadius:12,background:record.scannedHex,marginBottom:12}} />
            <div style={{textAlign:"center",fontFamily:"monospace",fontSize:16,fontWeight:700,color:INK_PRIMARY,marginBottom:16}}>{record.scannedHex}</div>
            <input placeholder='e.g. "My everyday lip"' value={shadeName} onChange={e=>setShadeName(e.target.value)} style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1px solid ${HAIRLINE}`,fontSize:14,marginBottom:12,background:BG_OFFWHITE,color:INK_PRIMARY}} />
            <button onClick={handleSaveShade} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:ACCENT_BLACK,color:BG_WHITE,fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Save to My Shades</button>
          </div>
        </div>
      )}
    </div>
  );
}
