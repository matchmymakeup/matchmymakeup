// ColorScanner — capture surface; monochrome chrome (Artefact 2 §7.2); button
// vocabulary (CircleIconButton, PillButton, Dropdown). Scan mechanism
// (canvas, eyedropper, /api/match, /api/advice) preserved unchanged.
//
// SessionStorage keys (locked 2026-05-02):
//   mmm_language    shared with Landing — last write wins
//   mmm_country     existing, now writes on every change (was read-only on init before)
//   mmm_skin_tone   NEW — write on change, read on mount
//   mmm_occasion    NEW — same
//   mmm_category    NEW — same, default 'lipstick'
//
// Tab inner functions (UploadTab/CameraTab/PickerTab) keep canvas refs
// always-mounted via display:none/block toggle — never conditional render.
// Restyled to monochrome (white/off-white/ink/black-accent per Artefact 2 §7.2); old #C9A96E gold and #B76E79 rose
// accents use ACCENT_BLACK per Artefact 2 §7.2 monochrome lock.
//
// English-only chrome per speed-mode brief. Existing 15-locale T table
// preserved for tab-internal strings (uploadTapPrompt, cameraError, etc.)
// — those are pre-v2.1 i18n that stays.
//
// NOTE: All UI in this file must render correctly at 360px viewport width
// for budget Android phones in India, Nigeria and Brazil.

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackScan, trackPageView } from "../analytics.js";
import { getColourName } from "../utils/colourNames.js";
import { saveScan, getStreak, saveStreak } from "../lib/storage";
import CircleIconButton from "../components/CircleIconButton";
import PillButton from "../components/PillButton";
import Dropdown from "../components/Dropdown";
import { BG_WHITE, INK_PRIMARY, INK_SECONDARY, ACCENT_BLACK, HAIRLINE, BORDER_ACTIVE } from "../lib/design-tokens";

// ─── v2.1 palette + typography ──────────────────────────────────────────
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS  = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

function toHex(r,g,b){ return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase(); }
function fromHex(hex){ const m=hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i); return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:null; }

// ─── 15-locale T table (preserved verbatim from pre-v2.1) ───────────────
const T = {
  en: { appTagline:"Scan a color. Find your perfect shade.", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Color", uploadTapPrompt:"Tap any point on the image to pick its color", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change image", cameraPrompt:"Point at a color and capture", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use the color wheel or type a hex code", hexLabel:"Hex", personalize:"✨ Personalize", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding your match...", pickFirst:"👆 Pick a color first", scanning:"🔍 Scanning product database...", gettingAdvice:"✨ Getting beauty advice...", cameraError:"Camera not available.", library:"📚 My Library" },
  hi: { appTagline:"रंग स्कैन करें। अपना परफेक्ट शेड खोजें।", upload:"📷 अपलोड", camera:"📸 कैमरा", pickColor:"🎨 रंग चुनें", uploadTapPrompt:"रंग चुनने के लिए इमेज पर कहीं भी टैप करें", choosePhoto:"फ़ोटो चुनें", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ इमेज बदलें", cameraPrompt:"किसी रंग पर कैमरा पॉइंट करें", startCamera:"कैमरा शुरू करें", capture:"📍 कैप्चर", pickerPrompt:"कलर व्हील इस्तेमाल करें", hexLabel:"हेक्स", personalize:"✨ व्यक्तिगत करें", skinToneLabel:"त्वचा का रंग", occasionLabel:"अवसर", categoryLabel:"श्रेणी", shopInLabel:"यहाँ खरीदें", skinTones:{any:"कोई भी",fair:"🤍 गोरी",light:"🍑 हल्की",medium:"🌼 मध्यम",tan:"🌻 सांवली",deep:"🌑 गहरी"}, occasions:{any:"कोई भी",daily:"☀️ रोज़ाना",office:"💼 ऑफिस",evening:"🌙 शाम",wedding:"💍 शादी",festival:"🎉 त्योहार"}, findMatch:"💄 मेरा मैच खोजें", finding:"✨ मैच ढूंढ रहे हैं...", pickFirst:"👆 पहले रंग चुनें", scanning:"🔍 स्कैन हो रहा है...", gettingAdvice:"✨ सलाह मिल रही है...", cameraError:"कैमरा उपलब्ध नहीं।", library:"📚 मेरी लाइब्रेरी" },
  pt: { appTagline:"Escaneie uma cor. Encontre seu tom perfeito.", upload:"📷 Enviar", camera:"📸 Câmera", pickColor:"🎨 Escolher Cor", uploadTapPrompt:"Toque em qualquer ponto da imagem para capturar a cor", choosePhoto:"Escolher Foto", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Trocar imagem", cameraPrompt:"Aponte para uma cor e capture", startCamera:"Iniciar Câmera", capture:"📍 Capturar", pickerPrompt:"Use o seletor de cor ou digite um hex", hexLabel:"Hex", personalize:"✨ Personalizar", skinToneLabel:"TOM DE PELE", occasionLabel:"OCASIÃO", categoryLabel:"CATEGORIA", shopInLabel:"COMPRAR EM", skinTones:{any:"Qualquer",fair:"🤍 Clara",light:"🍑 Leve",medium:"🌼 Média",tan:"🌻 Bronzeada",deep:"🌑 Escura"}, occasions:{any:"Qualquer",daily:"☀️ Diário",office:"💼 Trabalho",evening:"🌙 Noite",wedding:"💍 Casamento",festival:"🎉 Festival"}, findMatch:"💄 Encontrar Minha Combinação", finding:"✨ Encontrando...", pickFirst:"👆 Escolha uma cor primeiro", scanning:"🔍 Varrendo...", gettingAdvice:"✨ Obtendo conselho...", cameraError:"Câmera não disponível.", library:"📚 Minha Biblioteca" },
  zh: { appTagline:"扫描颜色，找到你的完美色号。", upload:"📷 上传", camera:"📸 相机", pickColor:"🎨 选色", uploadTapPrompt:"点击图片上的任意位置以提取颜色", choosePhoto:"选择照片", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ 更换图片", cameraPrompt:"将相机对准颜色并拍摄", startCamera:"开启相机", capture:"📍 拍摄", pickerPrompt:"使用调色盘或输入十六进制颜色", hexLabel:"色值", personalize:"✨ 个性化设置", skinToneLabel:"肤色", occasionLabel:"场合", categoryLabel:"类别", shopInLabel:"购物地区", skinTones:{any:"不限",fair:"🤍 白皙",light:"🍑 浅色",medium:"🌼 中等",tan:"🌻 小麦色",deep:"🌑 深色"}, occasions:{any:"不限",daily:"☀️ 日常",office:"💼 职场",evening:"🌙 夜晚",wedding:"💍 婚礼",festival:"🎉 节日"}, findMatch:"💄 找到我的匹配", finding:"✨ 正在匹配...", pickFirst:"👆 请先选择颜色", scanning:"🔍 扫描中...", gettingAdvice:"✨ 获取建议...", cameraError:"相机不可用。", library:"📚 我的收藏" },
  id: { appTagline:"Pindai warna. Temukan shade sempurnamu.", upload:"📷 Unggah", camera:"📸 Kamera", pickColor:"🎨 Pilih Warna", uploadTapPrompt:"Ketuk titik mana saja pada gambar", choosePhoto:"Pilih Foto", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Ganti gambar", cameraPrompt:"Arahkan ke warna dan ambil", startCamera:"Mulai Kamera", capture:"📍 Ambil", pickerPrompt:"Gunakan roda warna atau ketik hex", hexLabel:"Hex", personalize:"✨ Personalisasi", skinToneLabel:"WARNA KULIT", occasionLabel:"KESEMPATAN", categoryLabel:"KATEGORI", shopInLabel:"BELANJA DI", skinTones:{any:"Semua",fair:"🤍 Cerah",light:"🍑 Terang",medium:"🌼 Sedang",tan:"🌻 Sawo Matang",deep:"🌑 Gelap"}, occasions:{any:"Semua",daily:"☀️ Harian",office:"💼 Kantor",evening:"🌙 Malam",wedding:"💍 Pernikahan",festival:"🎉 Festival"}, findMatch:"💄 Temukan Kecocokan", finding:"✨ Mencari...", pickFirst:"👆 Pilih warna dulu", scanning:"🔍 Memindai...", gettingAdvice:"✨ Mendapat saran...", cameraError:"Kamera tidak tersedia.", library:"📚 Perpustakaan" },
  ng: { appTagline:"Scan your colour. Find your perfect shade!", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Colour", uploadTapPrompt:"Tap anywhere on the photo to grab that colour", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change photo", cameraPrompt:"Point camera at colour and capture am", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use colour wheel or type hex code", hexLabel:"Hex", personalize:"✨ Personalise", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding...", pickFirst:"👆 Pick a colour first", scanning:"🔍 Scanning...", gettingAdvice:"✨ Getting advice...", cameraError:"Camera no dey available.", library:"📚 My Library" },
  es: { appTagline:"Escanea un color. Encuentra tu tono perfecto.", upload:"📷 Subir", camera:"📸 Cámara", pickColor:"🎨 Elegir Color", uploadTapPrompt:"Toca cualquier punto de la imagen para capturar el color", choosePhoto:"Elegir Foto", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Cambiar imagen", cameraPrompt:"Apunta a un color y captura", startCamera:"Iniciar Cámara", capture:"📍 Capturar", pickerPrompt:"Usa el selector de color o escribe un código hex", hexLabel:"Hex", personalize:"✨ Personalizar", skinToneLabel:"TONO DE PIEL", occasionLabel:"OCASIÓN", categoryLabel:"CATEGORÍA", shopInLabel:"COMPRAR EN", skinTones:{any:"Todos",fair:"🤍 Clara",light:"🍑 Ligera",medium:"🌼 Media",tan:"🌻 Bronceada",deep:"🌑 Oscura"}, occasions:{any:"Todos",daily:"☀️ Diario",office:"💼 Oficina",evening:"🌙 Noche",wedding:"💍 Boda",festival:"🎉 Festival"}, findMatch:"💄 Encontrar Mi Combinación", finding:"✨ Buscando tu combinación...", pickFirst:"👆 Elige un color primero", scanning:"🔍 Escaneando productos...", gettingAdvice:"✨ Obteniendo consejos...", cameraError:"Cámara no disponible.", library:"📚 Mi Biblioteca" },
  ar: { appTagline:"امسح لونًا. اعثر على درجتك المثالية.", upload:"📷 رفع", camera:"📸 كاميرا", pickColor:"🎨 اختر لونًا", uploadTapPrompt:"انقر على أي نقطة في الصورة لالتقاط اللون", choosePhoto:"اختر صورة", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ تغيير الصورة", cameraPrompt:"وجّه الكاميرا نحو اللون والتقط", startCamera:"تشغيل الكاميرا", capture:"📍 التقاط", pickerPrompt:"استخدم عجلة الألوان أو اكتب رمز hex", hexLabel:"Hex", personalize:"✨ تخصيص", skinToneLabel:"لون البشرة", occasionLabel:"المناسبة", categoryLabel:"الفئة", shopInLabel:"تسوق في", skinTones:{any:"الكل",fair:"🤍 فاتحة",light:"🍑 خفيفة",medium:"🌼 متوسطة",tan:"🌻 قمحية",deep:"🌑 داكنة"}, occasions:{any:"الكل",daily:"☀️ يومي",office:"💼 عمل",evening:"🌙 مسائي",wedding:"💍 زفاف",festival:"🎉 مهرجان"}, findMatch:"💄 ابحث عن تطابقي", finding:"✨ جارٍ البحث...", pickFirst:"👆 اختر لونًا أولاً", scanning:"🔍 جارٍ المسح...", gettingAdvice:"✨ جارٍ الحصول على نصائح...", cameraError:"الكاميرا غير متاحة.", library:"📚 مكتبتي" },
  fr: { appTagline:"Scannez une couleur. Trouvez votre teinte parfaite.", upload:"📷 Importer", camera:"📸 Caméra", pickColor:"🎨 Choisir une couleur", uploadTapPrompt:"Appuyez sur un point de l'image pour capturer la couleur", choosePhoto:"Choisir une photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Changer d'image", cameraPrompt:"Dirigez vers une couleur et capturez", startCamera:"Démarrer la caméra", capture:"📍 Capturer", pickerPrompt:"Utilisez le sélecteur de couleur ou saisissez un code hex", hexLabel:"Hex", personalize:"✨ Personnaliser", skinToneLabel:"TEINT", occasionLabel:"OCCASION", categoryLabel:"CATÉGORIE", shopInLabel:"ACHETER DANS", skinTones:{any:"Tous",fair:"🤍 Clair",light:"🍑 Léger",medium:"🌼 Moyen",tan:"🌻 Hâlé",deep:"🌑 Foncé"}, occasions:{any:"Tous",daily:"☀️ Quotidien",office:"💼 Bureau",evening:"🌙 Soirée",wedding:"💍 Mariage",festival:"🎉 Festival"}, findMatch:"💄 Trouver Ma Correspondance", finding:"✨ Recherche en cours...", pickFirst:"👆 Choisissez une couleur d'abord", scanning:"🔍 Analyse des produits...", gettingAdvice:"✨ Obtention des conseils...", cameraError:"Caméra non disponible.", library:"📚 Ma Bibliothèque" },
  bn: { appTagline:"একটি রং স্ক্যান করুন। আপনার নিখুঁত শেড খুঁজুন।", upload:"📷 আপলোড", camera:"📸 ক্যামেরা", pickColor:"🎨 রং বাছুন", uploadTapPrompt:"রং নিতে ছবির যেকোনো জায়গায় ট্যাপ করুন", choosePhoto:"ছবি বাছুন", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ ছবি বদলান", cameraPrompt:"একটি রঙের দিকে ক্যামেরা তাক করুন", startCamera:"ক্যামেরা চালু করুন", capture:"📍 ক্যাপচার", pickerPrompt:"কালার হুইল ব্যবহার করুন বা হেক্স কোড লিখুন", hexLabel:"হেক্স", personalize:"✨ ব্যক্তিগতকরণ", skinToneLabel:"ত্বকের রং", occasionLabel:"উপলক্ষ", categoryLabel:"বিভাগ", shopInLabel:"কেনাকাটা করুন", skinTones:{any:"সব",fair:"🤍 ফর্সা",light:"🍑 হালকা",medium:"🌼 মাঝারি",tan:"🌻 শ্যামলা",deep:"🌑 গাঢ়"}, occasions:{any:"সব",daily:"☀️ দৈনিক",office:"💼 অফিস",evening:"🌙 সন্ধ্যা",wedding:"💍 বিয়ে",festival:"🎉 উৎসব"}, findMatch:"💄 আমার ম্যাচ খুঁজুন", finding:"✨ খুঁজছি...", pickFirst:"👆 আগে একটি রং বাছুন", scanning:"🔍 স্ক্যান হচ্ছে...", gettingAdvice:"✨ পরামর্শ আসছে...", cameraError:"ক্যামেরা পাওয়া যাচ্ছে না।", library:"📚 আমার লাইব্রেরি" },
  sw: { appTagline:"Changanua rangi. Pata kivuli chako kamilifu.", upload:"📷 Pakia", camera:"📸 Kamera", pickColor:"🎨 Chagua Rangi", uploadTapPrompt:"Gusa sehemu yoyote ya picha kuchagua rangi", choosePhoto:"Chagua Picha", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Badilisha picha", cameraPrompt:"Elekeza kamera kwenye rangi na unase", startCamera:"Anzisha Kamera", capture:"📍 Nasa", pickerPrompt:"Tumia gurudumu la rangi au andika msimbo wa hex", hexLabel:"Hex", personalize:"✨ Binafsisha", skinToneLabel:"RANGI YA NGOZI", occasionLabel:"TUKIO", categoryLabel:"AINA", shopInLabel:"NUNUA KATIKA", skinTones:{any:"Zote",fair:"🤍 Nyeupe",light:"🍑 Nyepesi",medium:"🌼 Wastani",tan:"🌻 Kahawia",deep:"🌑 Nyeusi"}, occasions:{any:"Zote",daily:"☀️ Kila siku",office:"💼 Ofisi",evening:"🌙 Jioni",wedding:"💍 Harusi",festival:"🎉 Tamasha"}, findMatch:"💄 Tafuta Mechi Yangu", finding:"✨ Inatafuta...", pickFirst:"👆 Chagua rangi kwanza", scanning:"🔍 Inachunguza...", gettingAdvice:"✨ Inapata ushauri...", cameraError:"Kamera haipatikani.", library:"📚 Maktaba Yangu" },
  tl: { appTagline:"I-scan ang kulay. Hanapin ang perpektong shade mo.", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pumili ng Kulay", uploadTapPrompt:"I-tap ang kahit saang bahagi ng larawan para kunin ang kulay", choosePhoto:"Pumili ng Larawan", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Palitan ang larawan", cameraPrompt:"Itutok ang camera sa kulay at kunan", startCamera:"Simulan ang Camera", capture:"📍 Kunan", pickerPrompt:"Gamitin ang color wheel o mag-type ng hex code", hexLabel:"Hex", personalize:"✨ I-personalize", skinToneLabel:"KULAY NG BALAT", occasionLabel:"OKASYON", categoryLabel:"KATEGORYA", shopInLabel:"MAMILI SA", skinTones:{any:"Lahat",fair:"🤍 Maputi",light:"🍑 Magaan",medium:"🌼 Katamtaman",tan:"🌻 Morena",deep:"🌑 Maitim"}, occasions:{any:"Lahat",daily:"☀️ Araw-araw",office:"💼 Opisina",evening:"🌙 Gabi",wedding:"💍 Kasal",festival:"🎉 Pista"}, findMatch:"💄 Hanapin ang Match Ko", finding:"✨ Hinahanap...", pickFirst:"👆 Pumili muna ng kulay", scanning:"🔍 Nag-i-scan...", gettingAdvice:"✨ Kumukuha ng payo...", cameraError:"Hindi available ang camera.", library:"📚 Aking Library" },
  'en-za': { appTagline:"Scan a colour. Find your perfect shade.", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Colour", uploadTapPrompt:"Tap any point on the image to pick its colour", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change image", cameraPrompt:"Point at a colour and capture", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use the colour wheel or type a hex code", hexLabel:"Hex", personalize:"✨ Personalise", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding your match...", pickFirst:"👆 Pick a colour first", scanning:"🔍 Scanning product database...", gettingAdvice:"✨ Getting beauty advice...", cameraError:"Camera not available.", library:"📚 My Library" },
  af: { appTagline:"Skandeer 'n kleur. Vind jou perfekte skakering.", upload:"📷 Laai op", camera:"📸 Kamera", pickColor:"🎨 Kies Kleur", uploadTapPrompt:"Tik op enige punt op die beeld om die kleur te kies", choosePhoto:"Kies Foto", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Verander beeld", cameraPrompt:"Wys na 'n kleur en neem vas", startCamera:"Begin Kamera", capture:"📍 Vasvat", pickerPrompt:"Gebruik die kleurwiel of tik 'n hex-kode", hexLabel:"Hex", personalize:"✨ Personaliseer", skinToneLabel:"VELTOON", occasionLabel:"GELEENTHEID", categoryLabel:"KATEGORIE", shopInLabel:"KOOP IN", skinTones:{any:"Alles",fair:"🤍 Lig",light:"🍑 Ligte",medium:"🌼 Medium",tan:"🌻 Bruin",deep:"🌑 Donker"}, occasions:{any:"Alles",daily:"☀️ Daagliks",office:"💼 Kantoor",evening:"🌙 Aand",wedding:"💍 Troue",festival:"🎉 Fees"}, findMatch:"💄 Vind My Pas", finding:"✨ Soek...", pickFirst:"👆 Kies eers 'n kleur", scanning:"🔍 Skandeer...", gettingAdvice:"✨ Kry raad...", cameraError:"Kamera nie beskikbaar nie.", library:"📚 My Biblioteek" },
  zu: { appTagline:"Skena umbala. Thola isithunzi sakho esiphelele.", upload:"📷 Layisha", camera:"📸 Ikhamera", pickColor:"🎨 Khetha Umbala", uploadTapPrompt:"Thepha noma yikuphi esithombeni ukukhetha umbala", choosePhoto:"Khetha Isithombe", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Shintsha isithombe", cameraPrompt:"Khomba ikhamera embaleni bese uthwebula", startCamera:"Qala Ikhamera", capture:"📍 Thwebula", pickerPrompt:"Sebenzisa isondo lombala noma uthayiphe ikhodi ye-hex", hexLabel:"Hex", personalize:"✨ Yenza okwakho", skinToneLabel:"UMBALA WESIKHUMBA", occasionLabel:"ISENZAKALO", categoryLabel:"UHLOBO", shopInLabel:"THENGA KU-", skinTones:{any:"Konke",fair:"🤍 Mhlophe",light:"🍑 Okukhanyayo",medium:"🌼 Maphakathi",tan:"🌻 Nsundu",deep:"🌑 Mnyama"}, occasions:{any:"Konke",daily:"☀️ Nsuku zonke",office:"💼 Ehhovisi",evening:"🌙 Kusihlwa",wedding:"💍 Umshado",festival:"🎉 Umkhosi"}, findMatch:"💄 Thola Okufanayo Kwami", finding:"✨ Kuyatholakala...", pickFirst:"👆 Khetha umbala kuqala", scanning:"🔍 Kuyaskenwa...", gettingAdvice:"✨ Kuthola iseluleko...", cameraError:"Ikhamera ayitholakali.", library:"📚 Umtapo Wami" },
};

// ─── Dropdown option arrays — English-only per speed-mode brief ────────
const CATEGORY_OPTIONS = [
  { value: 'lipstick',    label: 'Lipstick',    icon: '💄' },
  { value: 'nail_polish', label: 'Nail Polish', icon: '💅' },
  { value: 'foundation',  label: 'Foundation',  icon: '🧴' },
  { value: 'mascara',     label: 'Mascara',     icon: '👁️' },
  { value: 'blush',       label: 'Blush',       icon: '🌸' },
  { value: 'eyeshadow',   label: 'Eyeshadow',   icon: '✨' },
  { value: 'highlighter', label: 'Highlighter', icon: '🌟' },
  { value: 'lip_liner',   label: 'Lip Liner',   icon: '💋' },
];

const SKIN_TONE_OPTIONS = [
  { value: '',       label: 'Any',    icon: '🌍' },
  { value: 'Fair',   label: 'Fair',   icon: '🤍' },
  { value: 'Light',  label: 'Light',  icon: '🍑' },
  { value: 'Medium', label: 'Medium', icon: '🌼' },
  { value: 'Tan',    label: 'Tan',    icon: '🌻' },
  { value: 'Deep',   label: 'Deep',   icon: '🌑' },
];

const OCCASION_OPTIONS = [
  { value: '',         label: 'Any',      icon: '🌍' },
  { value: 'Daily',    label: 'Daily',    icon: '☀️' },
  { value: 'Office',   label: 'Office',   icon: '💼' },
  { value: 'Evening',  label: 'Evening',  icon: '🌙' },
  { value: 'Wedding',  label: 'Wedding',  icon: '💍' },
  { value: 'Festival', label: 'Festival', icon: '🎉' },
];

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

// 14-persona consultant list — duplicated from Landing.jsx PR4. Banked
// for centralisation in polish pass (third copy now: this file +
// Landing.jsx + ColorScanner inline at line 420 ± in pre-PR5 version).
const PERSONA_OPTIONS = [
  { value: 'en', icon: '🌍', label: 'English / Maya / Global' },
  { value: 'hi', icon: '🇮🇳', label: 'Hindi / Priya / India' },
  { value: 'pt', icon: '🇧🇷', label: 'Portuguese / Valentina / Brazil' },
  { value: 'zh', icon: '🇨🇳', label: 'Mandarin / Mei / China' },
  { value: 'id', icon: '🇮🇩', label: 'Bahasa / Sari / Indonesia' },
  { value: 'ng', icon: '🇳🇬', label: 'Pidgin / Adaeze / Nigeria' },
  { value: 'es', icon: '🇲🇽', label: 'Spanish / Isabella / Latin America' },
  { value: 'ar', icon: '🇪🇬', label: 'Arabic / Layla / MENA' },
  { value: 'fr', icon: '🇫🇷', label: 'French / Céline / France' },
  { value: 'bn', icon: '🇧🇩', label: 'Bengali / Ananya / Bangladesh' },
  { value: 'sw', icon: '🇹🇿', label: 'Swahili / Amara / East Africa' },
  { value: 'tl', icon: '🇵🇭', label: 'Tagalog / Gabriela / Philippines' },
  { value: 'af', icon: '🇿🇦', label: 'Afrikaans / Liezel / South Africa' },
  { value: 'zu', icon: '🇿🇦', label: 'Zulu / Nomvula / South Africa' },
];

// ─── UploadTab — restyled to v2.1 light theme ──────────────────────────
function UploadTab({onColorPicked, t}) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [pin, setPin] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const img = new Image();
      img.onload = function() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const maxW = canvas.parentElement ? (canvas.parentElement.offsetWidth || 340) : 340;
        const scale = Math.min(maxW / img.width, 320 / img.height, 1);
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setUploadedImage(true); setPin(null); onColorPicked(null);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleCanvasClick(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * canvas.width / rect.width);
    const y = Math.floor((e.clientY - rect.top) * canvas.height / rect.height);
    const pixel = canvas.getContext('2d').getImageData(Math.max(0,Math.min(canvas.width-1,x)), Math.max(0,Math.min(canvas.height-1,y)), 1, 1).data;
    const hex = toHex(pixel[0], pixel[1], pixel[2]);
    setPin({ cx: e.clientX - rect.left, cy: e.clientY - rect.top });
    onColorPicked({ r: pixel[0], g: pixel[1], b: pixel[2], hex });
  }

  function handleCanvasTouch(e) {
    e.preventDefault();
    const touch = e.changedTouches && e.changedTouches[0];
    if (touch) handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY });
  }

  function reset() {
    setUploadedImage(false); setPin(null); onColorPicked(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={handleFileChange} />
      {!uploadedImage && (
        <div onClick={()=>fileInputRef.current?.click()} onTouchEnd={e=>{e.preventDefault();fileInputRef.current?.click();}}
          style={{border:`2px dashed ${BORDER_ACTIVE}`,borderRadius:14,padding:'32px 20px',textAlign:'center',cursor:'pointer',background:BG_WHITE,fontFamily:SANS}}>
          <div style={{fontSize:40}}>🖼️</div>
          <div style={{color:INK_PRIMARY,fontWeight:700,marginTop:8,fontSize:14}}>{t.choosePhoto}</div>
          <div style={{color:INK_SECONDARY,fontSize:12,marginTop:4}}>{t.uploadFormats}</div>
        </div>
      )}
      <div style={{display:uploadedImage?'block':'none',position:'relative'}}>
        <canvas ref={canvasRef} onClick={handleCanvasClick} onTouchEnd={handleCanvasTouch}
          style={{width:'100%',borderRadius:12,cursor:'crosshair',touchAction:'none',display:'block'}} />
        {pin && <div style={{position:'absolute',left:pin.cx-11,top:pin.cy-11,width:22,height:22,borderRadius:'50%',border:`3px solid ${BG_WHITE}`,boxShadow:'0 0 0 2px rgba(0,0,0,0.6)',pointerEvents:'none'}} />}
        <p style={{textAlign:'center',fontSize:13,color:INK_SECONDARY,marginTop:8,fontFamily:SANS}}>{t.uploadTapPrompt}</p>
        <button onClick={reset} style={{display:'block',margin:'8px auto',background:'none',border:`1px solid ${HAIRLINE}`,borderRadius:20,padding:'4px 16px',cursor:'pointer',fontSize:13,color:INK_PRIMARY,fontFamily:SANS}}>{t.changeImage}</button>
      </div>
    </div>
  );
}

// ─── CameraTab — restyled to v2.1 light theme ──────────────────────────
function CameraTab({onColorPicked, t}) {
  const videoRef = useRef(null), canvasRef = useRef(null), streamRef = useRef(null);
  const [phase, setPhase] = useState("idle");
  const [camError, setCamError] = useState("");
  const [frozenSrc, setFrozenSrc] = useState(null);
  const [capturedColor, setCapturedColor] = useState(null);

  function stopStream() { if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;} if(videoRef.current)videoRef.current.srcObject=null; }
  useEffect(()=>()=>stopStream(),[]);

  async function startCamera() {
    setCamError(""); setFrozenSrc(null); setCapturedColor(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}});
      streamRef.current = stream; setPhase("live");
      requestAnimationFrame(()=>{ if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play().catch(()=>{});} });
    } catch(err) { setCamError(t.cameraError+(err?.message?` (${err.message})`:""));setPhase("idle"); }
  }

  function captureColor() {
    const v=videoRef.current,cv=canvasRef.current; if(!v||!cv||v.readyState<2)return;
    cv.width=v.videoWidth||640; cv.height=v.videoHeight||480;
    const ctx=cv.getContext("2d"); ctx.drawImage(v,0,0,cv.width,cv.height);
    const [r,g,b]=ctx.getImageData(Math.floor(cv.width/2),Math.floor(cv.height/2),1,1).data;
    const hex=toHex(r,g,b); const dataUrl=cv.toDataURL("image/jpeg",0.85);
    stopStream(); const col={r,g,b,hex};
    setFrozenSrc(dataUrl); setCapturedColor(col); onColorPicked(col); setPhase("captured");
  }

  function retake() { stopStream();setFrozenSrc(null);setCapturedColor(null);onColorPicked(null);setPhase("idle"); }

  const camBtnStyle = {background:ACCENT_BLACK,color:BG_WHITE,border:'none',borderRadius:14,padding:'13px 32px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:SANS};
  const camSecondary = {background:BG_WHITE,color:INK_PRIMARY,border:`1px solid ${HAIRLINE}`,borderRadius:14,padding:'13px 16px',cursor:'pointer',fontFamily:SANS};

  return (
    <div style={{textAlign:"center",fontFamily:SANS}}>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      {phase==="idle"&&(<div>
        <p style={{color:INK_PRIMARY,fontSize:13,margin:"0 0 12px"}}>{t.cameraPrompt}</p>
        <div style={{fontSize:48,marginBottom:12}}>📸</div>
        {camError&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 14px",color:"#dc2626",fontSize:12,marginBottom:14,textAlign:"left"}}>⚠️ {camError}</div>}
        <button onClick={startCamera} style={camBtnStyle}>{t.startCamera}</button>
      </div>)}
      {phase==="live"&&(<div>
        <div style={{position:"relative",borderRadius:14,overflow:"hidden",background:"#000",lineHeight:0}}>
          <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",display:"block",borderRadius:14,maxHeight:320,objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:60,height:60,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.9)",position:"absolute"}}/>
            <div style={{width:6,height:6,borderRadius:"50%",background:INK_PRIMARY,position:"absolute"}}/>
            <div style={{position:"absolute",width:40,height:1,background:"rgba(255,255,255,0.8)"}}/>
            <div style={{position:"absolute",width:1,height:40,background:"rgba(255,255,255,0.8)"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:12,justifyContent:"center"}}>
          <button onClick={captureColor} onTouchEnd={e=>{e.preventDefault();captureColor();}} style={camBtnStyle}>{t.capture}</button>
          <button onClick={retake} style={camSecondary}>✕</button>
        </div>
      </div>)}
      {phase==="captured"&&frozenSrc&&capturedColor&&(<div>
        <p style={{color:INK_PRIMARY,fontSize:13,margin:"0 0 10px"}}>✅ Color captured!</p>
        <div style={{position:"relative",borderRadius:14,overflow:"hidden",lineHeight:0,marginBottom:12}}>
          <img src={frozenSrc} alt="captured" style={{width:"100%",display:"block",borderRadius:14,maxHeight:320,objectFit:"cover"}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:24,height:24,borderRadius:"50%",background:capturedColor.hex,border:`3px solid ${BG_WHITE}`,boxShadow:"0 0 0 2px rgba(0,0,0,0.5)",pointerEvents:"none"}}/>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:BG_WHITE,borderRadius:12,padding:"8px 14px",marginBottom:14}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:capturedColor.hex,flexShrink:0}}/>
          <span style={{fontFamily:"monospace",fontWeight:700,fontSize:14,color:INK_PRIMARY}}>{capturedColor.hex}</span>
        </div>
        <div><button onClick={retake} style={{background:'none',border:`1px solid ${HAIRLINE}`,borderRadius:10,padding:"8px 20px",cursor:"pointer",fontSize:13,color:INK_PRIMARY,fontWeight:600,fontFamily:SANS}}>🔄 Retake</button></div>
      </div>)}
    </div>
  );
}

function hsvToRgb(h,s,v){
  const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}
  else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
  return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];
}
function rgbToHsv(r,g,b){
  r/=255;g/=255;b/=255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
  let h=0;
  if(d!==0){if(mx===r)h=((g-b)/d+6)%6*60;else if(mx===g)h=((b-r)/d+2)*60;else h=((r-g)/d+4)*60;}
  const s=mx===0?0:d/mx;
  return [h,s,mx];
}

// ─── PickerTab — restyled to v2.1 light theme ──────────────────────────
function PickerTab({color, onWheel, onHexType, t}) {
  const svCanvasRef = useRef(null);
  const hueCanvasRef = useRef(null);
  const svDragging = useRef(false);
  const hueDragging = useRef(false);

  const initColor = color?.hex && /^#[0-9A-Fa-f]{6}$/.test(color.hex) ? color : {hex:"#FF6B9D",r:255,g:107,b:157};
  const initHsv = rgbToHsv(initColor.r, initColor.g, initColor.b);
  const hueRef = useRef(initHsv[0]);
  const satRef = useRef(initHsv[1]);
  const valRef = useRef(initHsv[2]);

  const SV_SIZE = 240;
  const HUE_H = 28;

  function emit(h,s,v) {
    const [r,g,b] = hsvToRgb(h,s,v);
    const hex = toHex(r,g,b);
    onWheel({target:{value:hex}});
  }

  function drawSV() {
    const cv = svCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const w = cv.width, h = cv.height;
    const hueRgb = hsvToRgb(hueRef.current,1,1);
    const hGrad = ctx.createLinearGradient(0,0,w,0);
    hGrad.addColorStop(0,'#fff');
    hGrad.addColorStop(1,`rgb(${hueRgb[0]},${hueRgb[1]},${hueRgb[2]})`);
    ctx.fillStyle = hGrad;
    ctx.fillRect(0,0,w,h);
    const vGrad = ctx.createLinearGradient(0,0,0,h);
    vGrad.addColorStop(0,'rgba(0,0,0,0)');
    vGrad.addColorStop(1,'#000');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0,0,w,h);
  }

  function drawHue() {
    const cv = hueCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const grad = ctx.createLinearGradient(0,0,cv.width,0);
    for (let i=0;i<=6;i++) {
      const [r,g,b] = hsvToRgb(i*60,1,1);
      grad.addColorStop(i/6,`rgb(${r},${g},${b})`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,cv.width,cv.height);
  }

  useEffect(() => { drawSV(); drawHue(); }, []);

  useEffect(() => {
    if (color?.hex && /^#[0-9A-Fa-f]{6}$/.test(color.hex) && !svDragging.current && !hueDragging.current) {
      const rgb = fromHex(color.hex);
      if (rgb) {
        const [h,s,v] = rgbToHsv(rgb.r, rgb.g, rgb.b);
        hueRef.current = h; satRef.current = s; valRef.current = v;
        drawSV();
      }
    }
  }, [color?.hex]);

  function handleSV(clientX, clientY) {
    const cv = svCanvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    satRef.current = x;
    valRef.current = 1 - y;
    emit(hueRef.current, satRef.current, valRef.current);
  }

  function handleHue(clientX) {
    const cv = hueCanvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    hueRef.current = x * 360;
    drawSV();
    emit(hueRef.current, satRef.current, valRef.current);
  }

  function onSVDown(e) {
    e.preventDefault();
    svDragging.current = true;
    const pt = e.touches ? e.touches[0] : e;
    handleSV(pt.clientX, pt.clientY);
  }
  function onHueDown(e) {
    e.preventDefault();
    hueDragging.current = true;
    const pt = e.touches ? e.touches[0] : e;
    handleHue(pt.clientX);
  }

  useEffect(() => {
    function onMove(e) {
      const pt = e.touches ? e.touches[0] : e;
      if (svDragging.current) { e.preventDefault(); handleSV(pt.clientX, pt.clientY); }
      if (hueDragging.current) { e.preventDefault(); handleHue(pt.clientX); }
    }
    function onUp() { svDragging.current = false; hueDragging.current = false; }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const svX = satRef.current * 100;
  const svY = (1 - valRef.current) * 100;
  const hueX = (hueRef.current / 360) * 100;

  return (
    <div style={{textAlign:"center",fontFamily:SANS}}>
      <p style={{color:INK_PRIMARY,fontSize:13,margin:"0 0 12px"}}>{t.pickerPrompt}</p>

      <div style={{position:"relative",width:"100%",maxWidth:SV_SIZE,margin:"0 auto",aspectRatio:"1",borderRadius:12,overflow:"hidden",cursor:"crosshair",touchAction:"none"}}>
        <canvas ref={svCanvasRef} width={SV_SIZE} height={SV_SIZE}
          onMouseDown={onSVDown} onTouchStart={onSVDown}
          style={{width:"100%",height:"100%",display:"block",borderRadius:12}} />
        <div style={{position:"absolute",left:`${svX}%`,top:`${svY}%`,width:20,height:20,borderRadius:"50%",border:`3px solid ${BG_WHITE}`,boxShadow:"0 0 0 1px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.3)",transform:"translate(-50%,-50%)",pointerEvents:"none",background:color?.hex||"#FF6B9D"}} />
      </div>

      <div style={{position:"relative",width:"100%",maxWidth:SV_SIZE,margin:"12px auto 0",height:HUE_H,borderRadius:14,overflow:"hidden",cursor:"pointer",touchAction:"none"}}>
        <canvas ref={hueCanvasRef} width={SV_SIZE} height={HUE_H}
          onMouseDown={onHueDown} onTouchStart={onHueDown}
          style={{width:"100%",height:"100%",display:"block",borderRadius:14}} />
        <div style={{position:"absolute",left:`${hueX}%`,top:"50%",width:8,height:HUE_H+4,borderRadius:4,border:`3px solid ${BG_WHITE}`,boxShadow:"0 0 0 1px rgba(0,0,0,0.3)",transform:"translate(-50%,-50%)",pointerEvents:"none"}} />
      </div>

      <div style={{textAlign:"center",marginTop:16}}>
        <label style={{fontSize:12,color:INK_SECONDARY,fontWeight:600}}>{t.hexLabel}</label>
        <input type="text" value={color?.hex||""} onChange={onHexType} placeholder="#FF6B9D"
          style={{display:"block",margin:"4px auto 0",width:180,padding:"10px 14px",borderRadius:12,border:`2px solid ${HAIRLINE}`,textAlign:"center",fontFamily:"monospace",fontSize:15,fontWeight:700,background:BG_WHITE,color:INK_PRIMARY}}/>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────
export default function ColorScanner() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => sessionStorage.getItem('mmm_language') || sessionStorage.getItem('mmm_lang') || 'en');
  const t = T[lang] || T.en;
  const [tab, setTab] = useState("picker");
  const DEFAULT_COLOR = {hex:"#FF6B9D",r:255,g:107,b:157};
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [skinTone, setSkinTone] = useState(() => { try { return sessionStorage.getItem('mmm_skin_tone') || ""; } catch { return ""; } });
  const [occasion, setOccasion] = useState(() => { try { return sessionStorage.getItem('mmm_occasion') || ""; } catch { return ""; } });
  const [country, setCountry]   = useState(() => { try { return sessionStorage.getItem('mmm_country') || ""; } catch { return ""; } });
  const [category, setCategory] = useState(() => { try { return sessionStorage.getItem('mmm_category') || "lipstick"; } catch { return "lipstick"; } });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [streak, setStreak] = useState({ current_streak: 0, last_scan_date: null });

  // Persist dropdown selections to sessionStorage on every change.
  // Initial mount writes the defaults back — idempotent, harmless.
  useEffect(() => { try { sessionStorage.setItem('mmm_language',  lang);     } catch {} }, [lang]);
  useEffect(() => { try { sessionStorage.setItem('mmm_skin_tone', skinTone); } catch {} }, [skinTone]);
  useEffect(() => { try { sessionStorage.setItem('mmm_occasion',  occasion); } catch {} }, [occasion]);
  useEffect(() => { try { sessionStorage.setItem('mmm_country',   country);  } catch {} }, [country]);
  useEffect(() => { try { sessionStorage.setItem('mmm_category',  category); } catch {} }, [category]);

  useEffect(() => { trackPageView('ColorScanner'); }, []);

  useEffect(() => {
    let active = true
    getStreak().then(s => { if (active) setStreak(s) })
    return () => { active = false }
  }, []);

  function switchTab(id) {
    setTab(id);
    if (id === "picker") setColor(DEFAULT_COLOR);
    else if (id !== "camera") setColor(null);
  }

  function onWheel(e) { const rgb=fromHex(e.target.value); if(rgb)setColor({hex:e.target.value.toUpperCase(),...rgb}); }
  function onHexType(e) { const val=e.target.value; if(/^#[0-9A-Fa-f]{6}$/.test(val)){const rgb=fromHex(val);if(rgb)setColor({hex:val.toUpperCase(),...rgb});}else setColor(prev=>({...(prev||{r:0,g:0,b:0}),hex:val})); }

  async function handleFindMatch() {
    if(!color||!color.hex||!/^#[0-9A-Fa-f]{6}$/.test(color.hex)||loading) return;
    setLoading(true); setError(''); setStep(t.scanning);
    try {
      await trackScan({ hex: color.hex, r: color.r, g: color.g, b: color.b, skinTone, occasion, country, lang });
      const matchRes = await fetch('/api/match', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ r: color.r, g: color.g, b: color.b, country, category: category || null })
      });
      const matchData = await matchRes.json();
      if (!matchRes.ok) throw new Error(matchData.error || 'Failed to match products');
      const matches = matchData.matches;
      const fallbackToGlobal = matchData.fallbackToGlobal === true;
      const alias = matchData.alias || null;
      setStep(t.gettingAdvice);
      let userProfile = {};
      try { userProfile = JSON.parse(localStorage.getItem('mmm_profile') || '{}'); } catch {}
      const adviceRes = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hex: color.hex, r: color.r, g: color.g, b: color.b, skinTone, occasion, country, category, profile: userProfile, lang })
      });
      const adviceData = await adviceRes.json();
      if (!adviceRes.ok) throw new Error(adviceData.error || 'Failed to get advice');
      const claudeAdvice = adviceData.advice;
      try {
        await saveScan({
          color_hex: color.hex,
          skin_tone: skinTone,
          occasion,
          country,
          category,
          advice: claudeAdvice,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[ColorScanner] saveScan failed:', err);
      }
      const PERSONAS = {en:{name:'Maya',emoji:'💄'},hi:{name:'Priya',emoji:'🪷'},pt:{name:'Valentina',emoji:'💃'},zh:{name:'Mei',emoji:'🌸'},id:{name:'Sari',emoji:'🌺'},ng:{name:'Adaeze',emoji:'👑'},es:{name:'Isabella',emoji:'💃'},ar:{name:'Layla',emoji:'✨'},fr:{name:'Céline',emoji:'🗼'},bn:{name:'Ananya',emoji:'🌹'},sw:{name:'Amara',emoji:'🌍'},tl:{name:'Gabriela',emoji:'🌺'},af:{name:'Liezel',emoji:'🌸'},zu:{name:'Nomvula',emoji:'👑'}};
      const persona = PERSONAS[lang] || PERSONAS.en;
      sessionStorage.setItem('matchResults', JSON.stringify({
        scannedHex: color.hex, scannedRed: color.r, scannedGreen: color.g, scannedBlue: color.b,
        matchedProducts: matches, claudeAdvice, skinTone, occasion, country, category, lang,
        personaName: persona.name, personaEmoji: persona.emoji,
        fallbackToGlobal, alias
      }));
      try {
        const today = new Date().toISOString().slice(0,10);
        const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
        const current = await getStreak();
        let next;
        if (current.last_scan_date === today) next = current;
        else if (current.last_scan_date === yesterday) next = { current_streak: (current.current_streak || 0) + 1, last_scan_date: today };
        else next = { current_streak: 1, last_scan_date: today };
        if (next !== current) await saveStreak(next);
        setStreak(next);
      } catch (err) {
        console.error('[ColorScanner] streak update failed:', err);
      }
      navigate('/MatchResults');
    } catch(err) {
      setError(err?.message||'Something went wrong. Please try again.');
      setLoading(false); setStep('');
    }
  }

  const isReady = !!(color?.hex && /^#[0-9A-Fa-f]{6}$/.test(color.hex));

  // Dropdown row helper — centered label + centered fixed-width dropdown.
  // Equal-width treatment per CIT §3.4 (visual symmetry signals "five
  // equally weighted invitations to personalise"). Width 250 measured for
  // longest default consultant text "🌍 English / Maya / Global ▾".
  function DropdownRow({ label, ...dropdownProps }) {
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ display:'block',fontSize:11,fontWeight:600,color:INK_SECONDARY,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6,fontFamily:SANS,textAlign:'center' }}>{label}</label>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Dropdown width={250} {...dropdownProps} />
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:BG_WHITE,fontFamily:SANS}}>
      {/* Top utility bar */}
      <div style={{padding:"12px 16px 4px",maxWidth:560,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {streak.current_streak >= 1 && (
              <div style={{background:ACCENT_BLACK,color:BG_WHITE,borderRadius:20,padding:"4px 10px",fontSize:12,fontWeight:700}}>
                🔥 {streak.current_streak}
              </div>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={()=>navigate('/MyDNA')} style={{background:BG_WHITE,color:INK_PRIMARY,border:`1px solid ${HAIRLINE}`,borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",minHeight:32,fontFamily:SANS}}>
              My DNA
            </button>
            <button onClick={()=>navigate('/Library')} style={{background:BG_WHITE,color:INK_PRIMARY,border:`1px solid ${HAIRLINE}`,borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",minHeight:32,fontFamily:SANS}}>
              {t.library}
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px 60px"}}>

        {/* Hero */}
        <div style={{textAlign:'center',marginBottom:24}}>
          <h1 style={{margin:0,fontSize:28,fontWeight:400,color:INK_PRIMARY,fontFamily:SERIF,letterSpacing:'-0.02em',lineHeight:1.15,marginBottom:8}}>
            Find your shade
          </h1>
          <p style={{margin:0,fontSize:13,color:INK_SECONDARY,fontFamily:SANS,lineHeight:1.5}}>
            Upload a photo, use your camera, or pick a colour.
          </p>
        </div>

        {/* Three scan-mode CircleIconButtons */}
        <div style={{display:"flex",justifyContent:"center",gap:24,marginBottom:20,flexWrap:"wrap"}}>
          <CircleIconButton icon="📷" label="Upload Photo" active={tab==='upload'} onClick={()=>switchTab('upload')} />
          <CircleIconButton icon="📸" label="Camera Scan"  active={tab==='camera'} onClick={()=>switchTab('camera')} />
          <CircleIconButton icon="🎨" label="Pick Color"   active={tab==='picker'} onClick={()=>switchTab('picker')} />
        </div>

        {/* Scan card */}
        <div style={{background:BG_WHITE,borderRadius:18,padding:18,border:`1px solid ${HAIRLINE}`,marginBottom:14}}>
          {tab==="upload"&&<UploadTab onColorPicked={setColor} t={t}/>}
          {tab==="camera"&&<CameraTab onColorPicked={setColor} t={t}/>}
          {tab==="picker"&&<PickerTab color={color} onWheel={onWheel} onHexType={onHexType} t={t}/>}
        </div>

        {/* Color preview card */}
        {color?.hex&&/^#[0-9A-Fa-f]{6}$/.test(color.hex)&&(
          <div style={{background:BG_WHITE,borderRadius:18,padding:16,border:`1px solid ${HAIRLINE}`,marginBottom:14,display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:56,height:56,borderRadius:"50%",flexShrink:0,background:color.hex,boxShadow:`0 4px 14px ${color.hex}66`,border:`3px solid ${BG_WHITE}`}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:18,fontWeight:600,color:INK_PRIMARY,fontFamily:SERIF,marginBottom:4}}>{getColourName(color.r, color.g, color.b)}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
                <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:INK_PRIMARY}}>{color.hex}</div>
                <div style={{fontSize:11,color:INK_SECONDARY}}>R {color.r} · G {color.g} · B {color.b}</div>
              </div>
            </div>
          </div>
        )}

        {/* Five-dropdown personalise card */}
        <div style={{background:BG_WHITE,borderRadius:18,padding:18,border:`1px solid ${HAIRLINE}`,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:600,color:INK_SECONDARY,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:14,fontFamily:SANS}}>Personalise</div>
          {/* CIT §3.2 emotional reading order: relational anchor (consultant) →
              personal (skin tone) → contextual (occasion) → geographic (shop in) →
              commercial (category). Reorder locked PR-A.3 2026-05-07. */}
          <DropdownRow label="Consultant" value={lang}     options={PERSONA_OPTIONS}   onChange={setLang} />
          <DropdownRow label="Skin Tone"  value={skinTone} options={SKIN_TONE_OPTIONS} onChange={setSkinTone} placeholder="Any" align="center" />
          <DropdownRow label="Occasion"   value={occasion} options={OCCASION_OPTIONS}  onChange={setOccasion} placeholder="Any" align="center" />
          <DropdownRow label="Shop In"    value={country}  options={SHOP_IN_OPTIONS}   onChange={setCountry}  placeholder="Global" align="center" />
          <DropdownRow label="Category"   value={category} options={CATEGORY_OPTIONS}  onChange={setCategory} align="center" />
        </div>

        {/* Error */}
        {error && (
          <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:"12px 16px",color:"#dc2626",fontSize:13,marginBottom:12}}>
            ⚠️ {error}
          </div>
        )}

        {/* Find My Match — primary PillButton (centred; PillButton sizes
            to content, so width is label-width + padding rather than
            full-width. "Full-width" support would need a fullWidth prop
            on PillButton — banked for polish pass). */}
        <div style={{display:'flex',justifyContent:'center',marginTop:8,marginBottom:8}}>
          <PillButton
            onClick={handleFindMatch}
            active={true}
            disabled={!isReady || loading}
            size="lg"
          >
            {loading ? t.finding : isReady ? t.findMatch : t.pickFirst}
          </PillButton>
        </div>

        {loading && step && (
          <div style={{textAlign:"center",marginTop:10,color:INK_PRIMARY,fontSize:13,fontWeight:600,fontFamily:SANS}}>{step}</div>
        )}

        <p style={{textAlign:"center",fontSize:11,color:INK_SECONDARY,marginTop:24,fontFamily:SANS}}>
          By using this app you agree to our <span onClick={()=>navigate('/Terms')} style={{color:INK_PRIMARY,cursor:"pointer"}}>Terms & Conditions</span> and <span onClick={()=>navigate('/Privacy')} style={{color:INK_PRIMARY,cursor:"pointer"}}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
