import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { findColorMatches, CATEGORIES } from "../products.js";
import { trackScan, trackPageView } from "../analytics.js";

function toHex(r,g,b){ return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase(); }
function fromHex(hex){ const m=hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i); return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:null; }

const T = {
  en: { appTagline:"Scan a color. Find your perfect shade.", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Color", uploadTapPrompt:"Tap any point on the image to pick its color", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change image", cameraPrompt:"Point at a color and capture", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use the color wheel or type a hex code", hexLabel:"Hex", personalize:"✨ Personalize", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding your match...", pickFirst:"👆 Pick a color first", scanning:"🔍 Scanning product database...", gettingAdvice:"✨ Getting beauty advice...", cameraError:"Camera not available.", library:"📚 My Library" },
  hi: { appTagline:"रंग स्कैन करें। अपना परफेक्ट शेड खोजें।", upload:"📷 अपलोड", camera:"📸 कैमरा", pickColor:"🎨 रंग चुनें", uploadTapPrompt:"रंग चुनने के लिए इमेज पर कहीं भी टैप करें", choosePhoto:"फ़ोटो चुनें", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ इमेज बदलें", cameraPrompt:"किसी रंग पर कैमरा पॉइंट करें", startCamera:"कैमरा शुरू करें", capture:"📍 कैप्चर", pickerPrompt:"कलर व्हील इस्तेमाल करें", hexLabel:"हेक्स", personalize:"✨ व्यक्तिगत करें", skinToneLabel:"त्वचा का रंग", occasionLabel:"अवसर", categoryLabel:"श्रेणी", shopInLabel:"यहाँ खरीदें", skinTones:{any:"कोई भी",fair:"🤍 गोरी",light:"🍑 हल्की",medium:"🌼 मध्यम",tan:"🌻 सांवली",deep:"🌑 गहरी"}, occasions:{any:"कोई भी",daily:"☀️ रोज़ाना",office:"💼 ऑफिस",evening:"🌙 शाम",wedding:"💍 शादी",festival:"🎉 त्योहार"}, findMatch:"💄 मेरा मैच खोजें", finding:"✨ मैच ढूंढ रहे हैं...", pickFirst:"👆 पहले रंग चुनें", scanning:"🔍 स्कैन हो रहा है...", gettingAdvice:"✨ सलाह मिल रही है...", cameraError:"कैमरा उपलब्ध नहीं।", library:"📚 मेरी लाइब्रेरी" },
  pt: { appTagline:"Escaneie uma cor. Encontre seu tom perfeito.", upload:"📷 Enviar", camera:"📸 Câmera", pickColor:"🎨 Escolher Cor", uploadTapPrompt:"Toque em qualquer ponto da imagem para capturar a cor", choosePhoto:"Escolher Foto", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Trocar imagem", cameraPrompt:"Aponte para uma cor e capture", startCamera:"Iniciar Câmera", capture:"📍 Capturar", pickerPrompt:"Use o seletor de cor ou digite um hex", hexLabel:"Hex", personalize:"✨ Personalizar", skinToneLabel:"TOM DE PELE", occasionLabel:"OCASIÃO", categoryLabel:"CATEGORIA", shopInLabel:"COMPRAR EM", skinTones:{any:"Qualquer",fair:"🤍 Clara",light:"🍑 Leve",medium:"🌼 Média",tan:"🌻 Bronzeada",deep:"🌑 Escura"}, occasions:{any:"Qualquer",daily:"☀️ Diário",office:"💼 Trabalho",evening:"🌙 Noite",wedding:"💍 Casamento",festival:"🎉 Festival"}, findMatch:"💄 Encontrar Minha Combinação", finding:"✨ Encontrando...", pickFirst:"👆 Escolha uma cor primeiro", scanning:"🔍 Varrendo...", gettingAdvice:"✨ Obtendo conselho...", cameraError:"Câmera não disponível.", library:"📚 Minha Biblioteca" },
  zh: { appTagline:"扫描颜色，找到你的完美色号。", upload:"📷 上传", camera:"📸 相机", pickColor:"🎨 选色", uploadTapPrompt:"点击图片上的任意位置以提取颜色", choosePhoto:"选择照片", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ 更换图片", cameraPrompt:"将相机对准颜色并拍摄", startCamera:"开启相机", capture:"📍 拍摄", pickerPrompt:"使用调色盘或输入十六进制颜色", hexLabel:"色值", personalize:"✨ 个性化设置", skinToneLabel:"肤色", occasionLabel:"场合", categoryLabel:"类别", shopInLabel:"购物地区", skinTones:{any:"不限",fair:"🤍 白皙",light:"🍑 浅色",medium:"🌼 中等",tan:"🌻 小麦色",deep:"🌑 深色"}, occasions:{any:"不限",daily:"☀️ 日常",office:"💼 职场",evening:"🌙 夜晚",wedding:"💍 婚礼",festival:"🎉 节日"}, findMatch:"💄 找到我的匹配", finding:"✨ 正在匹配...", pickFirst:"👆 请先选择颜色", scanning:"🔍 扫描中...", gettingAdvice:"✨ 获取建议...", cameraError:"相机不可用。", library:"📚 我的收藏" },
  id: { appTagline:"Pindai warna. Temukan shade sempurnamu.", upload:"📷 Unggah", camera:"📸 Kamera", pickColor:"🎨 Pilih Warna", uploadTapPrompt:"Ketuk titik mana saja pada gambar", choosePhoto:"Pilih Foto", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Ganti gambar", cameraPrompt:"Arahkan ke warna dan ambil", startCamera:"Mulai Kamera", capture:"📍 Ambil", pickerPrompt:"Gunakan roda warna atau ketik hex", hexLabel:"Hex", personalize:"✨ Personalisasi", skinToneLabel:"WARNA KULIT", occasionLabel:"KESEMPATAN", categoryLabel:"KATEGORI", shopInLabel:"BELANJA DI", skinTones:{any:"Semua",fair:"🤍 Cerah",light:"🍑 Terang",medium:"🌼 Sedang",tan:"🌻 Sawo Matang",deep:"🌑 Gelap"}, occasions:{any:"Semua",daily:"☀️ Harian",office:"💼 Kantor",evening:"🌙 Malam",wedding:"💍 Pernikahan",festival:"🎉 Festival"}, findMatch:"💄 Temukan Kecocokan", finding:"✨ Mencari...", pickFirst:"👆 Pilih warna dulu", scanning:"🔍 Memindai...", gettingAdvice:"✨ Mendapat saran...", cameraError:"Kamera tidak tersedia.", library:"📚 Perpustakaan" },
  ng: { appTagline:"Scan your colour. Find your perfect shade!", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Colour", uploadTapPrompt:"Tap anywhere on the photo to grab that colour", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change photo", cameraPrompt:"Point camera at colour and capture am", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use colour wheel or type hex code", hexLabel:"Hex", personalize:"✨ Personalise", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding...", pickFirst:"👆 Pick a colour first", scanning:"🔍 Scanning...", gettingAdvice:"✨ Getting advice...", cameraError:"Camera no dey available.", library:"📚 My Library" },
};

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
    const x = Math.floor((e.clien
