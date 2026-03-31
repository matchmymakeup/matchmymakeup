import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../products.js";
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
  es: { appTagline:"Scan a color. Find your perfect shade.", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Color", uploadTapPrompt:"Tap any point on the image to pick its color", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change image", cameraPrompt:"Point at a color and capture", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use the color wheel or type a hex code", hexLabel:"Hex", personalize:"✨ Personalize", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding your match...", pickFirst:"👆 Pick a color first", scanning:"🔍 Scanning product database...", gettingAdvice:"✨ Getting beauty advice...", cameraError:"Camera not available.", library:"📚 My Library" },
  ar: { appTagline:"Scan a color. Find your perfect shade.", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Color", uploadTapPrompt:"Tap any point on the image to pick its color", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change image", cameraPrompt:"Point at a color and capture", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use the color wheel or type a hex code", hexLabel:"Hex", personalize:"✨ Personalize", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding your match...", pickFirst:"👆 Pick a color first", scanning:"🔍 Scanning product database...", gettingAdvice:"✨ Getting beauty advice...", cameraError:"Camera not available.", library:"📚 My Library" },
  fr: { appTagline:"Scan a color. Find your perfect shade.", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Color", uploadTapPrompt:"Tap any point on the image to pick its color", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change image", cameraPrompt:"Point at a color and capture", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use the color wheel or type a hex code", hexLabel:"Hex", personalize:"✨ Personalize", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding your match...", pickFirst:"👆 Pick a color first", scanning:"🔍 Scanning product database...", gettingAdvice:"✨ Getting beauty advice...", cameraError:"Camera not available.", library:"📚 My Library" },
  bn: { appTagline:"Scan a color. Find your perfect shade.", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Color", uploadTapPrompt:"Tap any point on the image to pick its color", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change image", cameraPrompt:"Point at a color and capture", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use the color wheel or type a hex code", hexLabel:"Hex", personalize:"✨ Personalize", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding your match...", pickFirst:"👆 Pick a color first", scanning:"🔍 Scanning product database...", gettingAdvice:"✨ Getting beauty advice...", cameraError:"Camera not available.", library:"📚 My Library" },
  sw: { appTagline:"Scan a color. Find your perfect shade.", upload:"📷 Upload", camera:"📸 Camera", pickColor:"🎨 Pick Color", uploadTapPrompt:"Tap any point on the image to pick its color", choosePhoto:"Choose Photo", uploadFormats:"JPG · PNG · WEBP", changeImage:"↩ Change image", cameraPrompt:"Point at a color and capture", startCamera:"Start Camera", capture:"📍 Capture", pickerPrompt:"Use the color wheel or type a hex code", hexLabel:"Hex", personalize:"✨ Personalize", skinToneLabel:"SKIN TONE", occasionLabel:"OCCASION", categoryLabel:"CATEGORY", shopInLabel:"SHOP IN", skinTones:{any:"Any",fair:"🤍 Fair",light:"🍑 Light",medium:"🌼 Medium",tan:"🌻 Tan",deep:"🌑 Deep"}, occasions:{any:"Any",daily:"☀️ Daily",office:"💼 Office",evening:"🌙 Evening",wedding:"💍 Wedding",festival:"🎉 Festival"}, findMatch:"💄 Find My Match", finding:"✨ Finding your match...", pickFirst:"👆 Pick a color first", scanning:"🔍 Scanning product database...", gettingAdvice:"✨ Getting beauty advice...", cameraError:"Camera not available.", library:"📚 My Library" },
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
          style={{border:'2px dashed #B76E79',borderRadius:14,padding:'32px 20px',textAlign:'center',cursor:'pointer',background:'#2C2C2E'}}>
          <div style={{fontSize:40}}>🖼️</div>
          <div style={{color:'#B76E79',fontWeight:700,marginTop:8,fontSize:14}}>{t.choosePhoto}</div>
          <div style={{color:'#aaa',fontSize:12,marginTop:4}}>{t.uploadFormats}</div>
        </div>
      )}
      <div style={{display:uploadedImage?'block':'none',position:'relative'}}>
        <canvas ref={canvasRef} onClick={handleCanvasClick} onTouchEnd={handleCanvasTouch}
          style={{width:'100%',borderRadius:12,cursor:'crosshair',touchAction:'none',display:'block'}} />
        {pin && <div style={{position:'absolute',left:pin.cx-11,top:pin.cy-11,width:22,height:22,borderRadius:'50%',border:'3px solid white',boxShadow:'0 0 0 2px rgba(0,0,0,0.7)',pointerEvents:'none'}} />}
        <p style={{textAlign:'center',fontSize:13,color:'#999',marginTop:8}}>{t.uploadTapPrompt}</p>
        <button onClick={reset} style={{display:'block',margin:'8px auto',background:'none',border:'1px solid #555',borderRadius:20,padding:'4px 16px',cursor:'pointer',fontSize:13,color:'#F5F0E8'}}>{t.changeImage}</button>
      </div>
    </div>
  );
}

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

  return (
    <div style={{textAlign:"center"}}>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      {phase==="idle"&&(<div>
        <p style={{color:"#F5F0E8",fontSize:13,margin:"0 0 12px"}}>{t.cameraPrompt}</p>
        <div style={{fontSize:48,marginBottom:12}}>📸</div>
        {camError&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 14px",color:"#dc2626",fontSize:12,marginBottom:14,textAlign:"left"}}>⚠️ {camError}</div>}
        <button onClick={startCamera} style={{background:"#C9A96E",color:"#1C1C1E",border:"none",borderRadius:14,padding:"13px 32px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.startCamera}</button>
      </div>)}
      {phase==="live"&&(<div>
        <div style={{position:"relative",borderRadius:14,overflow:"hidden",background:"#000",lineHeight:0}}>
          <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",display:"block",borderRadius:14,maxHeight:320,objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:60,height:60,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.9)",position:"absolute"}}/>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#2C2C2E",position:"absolute"}}/>
            <div style={{position:"absolute",width:40,height:1,background:"rgba(255,255,255,0.8)"}}/>
            <div style={{position:"absolute",width:1,height:40,background:"rgba(255,255,255,0.8)"}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:12,justifyContent:"center"}}>
          <button onClick={captureColor} onTouchEnd={e=>{e.preventDefault();captureColor();}} style={{background:"#C9A96E",color:"#1C1C1E",border:"none",borderRadius:14,padding:"13px 32px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.capture}</button>
          <button onClick={retake} style={{background:"#f3f4f6",color:"#F5F0E8",border:"none",borderRadius:14,padding:"13px 16px",cursor:"pointer"}}>✕</button>
        </div>
      </div>)}
      {phase==="captured"&&frozenSrc&&capturedColor&&(<div>
        <p style={{color:"#F5F0E8",fontSize:13,margin:"0 0 10px"}}>✅ Color captured!</p>
        <div style={{position:"relative",borderRadius:14,overflow:"hidden",lineHeight:0,marginBottom:12}}>
          <img src={frozenSrc} alt="captured" style={{width:"100%",display:"block",borderRadius:14,maxHeight:320,objectFit:"cover"}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:24,height:24,borderRadius:"50%",background:capturedColor.hex,border:"3px solid white",boxShadow:"0 0 0 2px rgba(0,0,0,0.5)",pointerEvents:"none"}}/>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f9f9f9",borderRadius:12,padding:"8px 14px",marginBottom:14}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:capturedColor.hex,flexShrink:0}}/>
          <span style={{fontFamily:"monospace",fontWeight:700,fontSize:14,color:"#111"}}>{capturedColor.hex}</span>
        </div>
        <div><button onClick={retake} style={{background:"none",border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 20px",cursor:"pointer",fontSize:13,color:"#F5F0E8",fontWeight:600}}>🔄 Retake</button></div>
      </div>)}
    </div>
  );
}

function PickerTab({color, onWheel, onHexType, t}) {
  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:"#F5F0E8",fontSize:13,margin:"0 0 12px"}}>{t.pickerPrompt}</p>
      <input type="color" value={color?.hex||"#FF6B9D"} onChange={onWheel}
        style={{width:120,height:120,borderRadius:"50%",border:"none",cursor:"pointer",background:"none",padding:0}}/>
      <div style={{marginTop:16}}>
        <label style={{fontSize:12,color:"#888",fontWeight:600}}>{t.hexLabel}</label>
        <input type="text" value={color?.hex||""} onChange={onHexType} placeholder="#FF6B9D"
          style={{display:"block",margin:"8px auto 0",width:140,padding:"10px 14px",borderRadius:12,border:"2px solid #e5e7eb",textAlign:"center",fontFamily:"monospace",fontSize:15,fontWeight:700}}/>
      </div>
    </div>
  );
}

function getStreak() {
  try {
    const data = JSON.parse(localStorage.getItem('mmm_streak') || '{}');
    const today = new Date().toISOString().slice(0,10);
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    if (data.lastDate === today) return { count: data.count || 1, lastDate: today };
    if (data.lastDate === yesterday) return { count: (data.count || 0), lastDate: data.lastDate };
    return { count: 0, lastDate: null };
  } catch { return { count: 0, lastDate: null }; }
}
function updateStreak() {
  const today = new Date().toISOString().slice(0,10);
  const streak = getStreak();
  if (streak.lastDate === today) return streak;
  const newCount = streak.lastDate === new Date(Date.now()-86400000).toISOString().slice(0,10) ? streak.count + 1 : 1;
  const next = { count: newCount, lastDate: today };
  localStorage.setItem('mmm_streak', JSON.stringify(next));
  return next;
}

export default function ColorScanner() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => sessionStorage.getItem('mmm_language') || sessionStorage.getItem('mmm_lang') || 'en');
  const t = T[lang] || T.en;
  const [tab, setTab] = useState("picker");
  const DEFAULT_COLOR = {hex:"#FF6B9D",r:255,g:107,b:157};
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [skinTone, setSkinTone] = useState("");
  const [occasion, setOccasion] = useState("");
  const [country, setCountry] = useState(() => sessionStorage.getItem('mmm_country') || "");
  const [category, setCategory] = useState("lipstick");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(getStreak);

  useEffect(() => { trackPageView('ColorScanner'); }, []);

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
        const lib = JSON.parse(localStorage.getItem('mmm_library') || '{"scans":[],"images":{}}');
        lib.scans = lib.scans || [];
        lib.scans.push({ color, skinTone, occasion, country, category, advice: claudeAdvice, date: new Date().toISOString() });
        if (lib.scans.length > 50) lib.scans = lib.scans.slice(-50);
        localStorage.setItem('mmm_library', JSON.stringify(lib));
      } catch(e) {}
      const PERSONAS = {en:{name:'Maya',emoji:'💄'},hi:{name:'Priya',emoji:'🪷'},pt:{name:'Valentina',emoji:'💃'},zh:{name:'Mei',emoji:'🌸'},id:{name:'Sari',emoji:'🌺'},ng:{name:'Adaeze',emoji:'👑'},es:{name:'Isabella',emoji:'💃'},ar:{name:'Layla',emoji:'✨'},fr:{name:'Céline',emoji:'🗼'},bn:{name:'Ananya',emoji:'🌹'},sw:{name:'Amara',emoji:'🌍'}};
      const persona = PERSONAS[lang] || PERSONAS.en;
      sessionStorage.setItem('matchResults', JSON.stringify({
        scannedHex: color.hex, scannedRed: color.r, scannedGreen: color.g, scannedBlue: color.b,
        matchedProducts: matches, claudeAdvice, skinTone, occasion, country, category, lang,
        personaName: persona.name, personaEmoji: persona.emoji
      }));
      setStreak(updateStreak());
      navigate('/MatchResults');
    } catch(err) {
      setError(err?.message||'Something went wrong. Please try again.');
      setLoading(false); setStep('');
    }
  }

  const isReady = !!(color?.hex && /^#[0-9A-Fa-f]{6}$/.test(color.hex));

  const pillBtn = (id, label) => (
    <button key={id} onClick={()=>switchTab(id)} style={{flex:1,padding:"10px 4px",border:"none",borderRadius:12,cursor:"pointer",fontSize:12,fontWeight:600,background:tab===id?"#C9A96E":"transparent",color:tab===id?"white":"#666"}}>
      {label}
    </button>
  );

  return (
    <div style={{minHeight:"100vh",background:"#1C1C1E",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{padding:"12px 16px 4px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            {streak.count >= 1 && (
              <div style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:"#1C1C1E",borderRadius:20,padding:"4px 8px",fontSize:12,fontWeight:700}}>
                🔥 {streak.count}
              </div>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={()=>navigate('/Profile')} style={{background:"#C9A96E",color:"#1C1C1E",border:"none",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",minHeight:32}}>
              {(()=>{ try { const p=JSON.parse(localStorage.getItem('mmm_profile')||'{}'); return (p.skinTone&&p.ageRange&&p.ethnicity?.length&&p.skinConcerns?.length&&p.beautyGoals?.length&&p.budget&&p.climate)?'✨ My DNA':'🧬 DNA'; } catch { return '🧬 DNA'; } })()}
            </button>
            <button onClick={()=>navigate('/Library')} style={{background:"#2C2C2E",color:"#C9A96E",border:"1px solid #e5e7eb",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",minHeight:32}}>
              {t.library}
            </button>
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:28}}>💄</div>
          <h1 style={{margin:"4px 0 2px",fontSize:20,fontWeight:900,background:"#C9A96E",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MatchMyMakeup<span style={{fontSize:10}}>™</span></h1>
          <p style={{margin:"0 0 4px",fontSize:12,color:"#F5F0E8",lineHeight:1.4}}>Upload a photo, use your camera, or pick a color to find your perfect makeup match.</p>
          {streak.count >= 7 && (
            <div style={{fontSize:12,color:"#C9A96E",fontWeight:600,marginTop:2}}>
              Maya knows your style — 7x more personalised ✨
            </div>
          )}
        </div>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px 48px"}}>
        <div style={{display:"flex",background:"#2C2C2E",borderRadius:16,padding:4,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
          {pillBtn("upload", t.upload)}
          {pillBtn("camera", t.camera)}
          {pillBtn("picker", t.pickColor)}
        </div>

        <div style={{background:"#2C2C2E",borderRadius:20,padding:18,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:14}}>
          {tab==="upload"&&<UploadTab onColorPicked={setColor} t={t}/>}
          {tab==="camera"&&<CameraTab onColorPicked={setColor} t={t}/>}
          {tab==="picker"&&<PickerTab color={color} onWheel={onWheel} onHexType={onHexType} t={t}/>}
        </div>

        {color?.hex&&/^#[0-9A-Fa-f]{6}$/.test(color.hex)&&(
          <div style={{background:"#2C2C2E",borderRadius:20,padding:16,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:14,display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:56,height:56,borderRadius:"50%",flexShrink:0,background:color.hex,boxShadow:`0 4px 18px ${color.hex}80`}}/>
            <div>
              <div style={{fontFamily:"monospace",fontSize:22,fontWeight:800,color:"#F5F0E8"}}>{color.hex}</div>
              <div style={{fontSize:13,color:"#F5F0E8",marginTop:3}}>R <b style={{color:"#ef4444"}}>{color.r}</b> &nbsp; G <b style={{color:"#22c55e"}}>{color.g}</b> &nbsp; B <b style={{color:"#3b82f6"}}>{color.b}</b></div>
            </div>
          </div>
        )}

        <div style={{background:"#2C2C2E",borderRadius:20,padding:18,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:"#F5F0E8",marginBottom:12}}>{t.personalize}</div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:11,color:"#888",fontWeight:700,marginBottom:8,letterSpacing:1}}>{t.categoryLabel}</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={()=>setCategory(cat.id==='all'?'':cat.id)}
                  style={{padding:"8px 14px",borderRadius:20,cursor:"pointer",border:(category===cat.id||(cat.id==='all'&&!category))?"2px solid #B76E79":"2px solid #555",background:(category===cat.id||(cat.id==='all'&&!category))?"#2C2C2E":"#3C3C3E",color:(category===cat.id||(cat.id==='all'&&!category))?"#B76E79":"#F5F0E8",fontSize:12,fontWeight:(category===cat.id||(cat.id==='all'&&!category))?700:500}}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <div style={{flex:1}}>
              <label style={{display:"block",fontSize:11,color:"#888",fontWeight:600,marginBottom:4}}>{t.skinToneLabel}</label>
              <select value={skinTone} onChange={e=>setSkinTone(e.target.value)} style={{width:"100%",padding:"9px 10px",borderRadius:10,border:"1px solid #555",fontSize:12,background:"#3C3C3E",color:"#F5F0E8"}}>
                <option value="">{t.skinTones.any}</option>
                <option value="Fair">{t.skinTones.fair}</option>
                <option value="Light">{t.skinTones.light}</option>
                <option value="Medium">{t.skinTones.medium}</option>
                <option value="Tan">{t.skinTones.tan}</option>
                <option value="Deep">{t.skinTones.deep}</option>
              </select>
            </div>
            <div style={{flex:1}}>
              <label style={{display:"block",fontSize:11,color:"#888",fontWeight:600,marginBottom:4}}>{t.occasionLabel}</label>
              <select value={occasion} onChange={e=>setOccasion(e.target.value)} style={{width:"100%",padding:"9px 10px",borderRadius:10,border:"1px solid #555",fontSize:12,background:"#3C3C3E",color:"#F5F0E8"}}>
                <option value="">{t.occasions.any}</option>
                <option value="Daily">{t.occasions.daily}</option>
                <option value="Office">{t.occasions.office}</option>
                <option value="Evening">{t.occasions.evening}</option>
                <option value="Wedding">{t.occasions.wedding}</option>
                <option value="Festival">{t.occasions.festival}</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,color:"#888",fontWeight:600,marginBottom:8}}>LANGUAGE</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {[["en","🇺🇸 EN"],["hi","🇮🇳 HI"],["pt","🇧🇷 PT"],["zh","🇨🇳 ZH"],["id","🇮🇩 ID"],["ng","🇳🇬 NG"],["es","🇲🇽 ES"],["ar","🇸🇦 AR"],["fr","🇫🇷 FR"],["bn","🇧🇩 BN"],["sw","🇰🇪 SW"]].map(([id,label])=>(
                <button key={id} onClick={()=>setLang(id)} style={{padding:"8px 14px",borderRadius:20,cursor:"pointer",border:lang===id?"2px solid #C9A96E":"2px solid #555",background:lang===id?"#2C2C2E":"#3C3C3E",color:lang===id?"#C9A96E":"#F5F0E8",fontSize:12,fontWeight:lang===id?700:500}}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,color:"#888",fontWeight:600,marginBottom:8}}>{t.shopInLabel}</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {[["","🌍 All"],["USA","🇺🇸 USA"],["Australia","🇦🇺 Australia"],["India","🇮🇳 India"],["Brazil","🇧🇷 Brazil"],["Indonesia","🇮🇩 Indonesia"],["Nigeria","🇳🇬 Nigeria"],["China","🇨🇳 China"]].map(([val,label])=>(
                <button key={val} onClick={()=>setCountry(val)} style={{padding:"8px 14px",borderRadius:20,cursor:"pointer",border:country===val?"2px solid #C9A96E":"2px solid #555",background:country===val?"#2C2C2E":"#3C3C3E",color:country===val?"#C9A96E":"#F5F0E8",fontSize:12,fontWeight:country===val?700:500}}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:"12px 16px",color:"#dc2626",fontSize:13,marginBottom:12}}>⚠️ {error}</div>}

        <button onClick={handleFindMatch} disabled={!isReady||loading}
          style={{width:"100%",padding:"17px",fontSize:16,fontWeight:800,border:"none",borderRadius:16,cursor:!isReady||loading?"not-allowed":"pointer",background:!isReady||loading?"#e5e7eb":"#C9A96E",color:!isReady||loading?"#aaa":"white",boxShadow:isReady&&!loading?"0 6px 24px rgba(124,58,237,0.35)":"none",transition:"all 0.2s"}}>
          {loading?t.finding:isReady?t.findMatch:t.pickFirst}
        </button>

        {loading&&step&&<div style={{textAlign:"center",marginTop:10,color:"#C9A96E",fontSize:13,fontWeight:600}}>{step}</div>}

        <p style={{textAlign:"center",fontSize:11,color:"#bbb",marginTop:16}}>
          By using this app you agree to our <span onClick={()=>navigate('/Terms')} style={{color:"#B76E79",cursor:"pointer"}}>Terms & Conditions</span> including anonymous data collection for market research.
        </p>
      </div>
    </div>
  );
}
