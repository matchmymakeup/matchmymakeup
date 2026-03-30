<div style={{maxWidth:480,margin:"0 auto",padding:"0 16px 48px"}}>
    <div style={{display:"flex",background:"white",borderRadius:16,padding:4,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
      {pillBtn("upload", t.upload)}
      {pillBtn("camera", t.camera)}
      {pillBtn("picker", t.pickColor)}
    </div>

    <div style={{background:"white",borderRadius:20,padding:18,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:14}}>
      {tab==="upload"&&<UploadTab onColorPicked={setColor} t={t}/>}
      {tab==="camera"&&<CameraTab onColorPicked={setColor} t={t}/>}
      {tab==="picker"&&<PickerTab color={color} onWheel={onWheel} onHexType={onHexType} t={t}/>}
    </div>

    {color?.hex&&/^#[0-9A-Fa-f]{6}$/.test(color.hex)&&(
      <div style={{background:"white",borderRadius:20,padding:16,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:14,display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:56,height:56,borderRadius:"50%",flexShrink:0,background:color.hex,boxShadow:`0 4px 18px ${color.hex}80`}}/>
        <div>
          <div style={{fontFamily:"monospace",fontSize:22,fontWeight:800,color:"#111"}}>{color.hex}</div>
          <div style={{fontSize:13,color:"#888",marginTop:3}}>R <b style={{color:"#ef4444"}}>{color.r}</b> &nbsp; G <b style={{color:"#22c55e"}}>{color.g}</b> &nbsp; B <b style={{color:"#3b82f6"}}>{color.b}</b></div>
        </div>
      </div>
    )}

    <div style={{background:"white",borderRadius:20,padding:18,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:12}}>{t.personalize}</div>
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:11,color:"#888",fontWeight:700,marginBottom:8,letterSpacing:1}}>{t.categoryLabel}</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={()=>setCategory(cat.id==='all'?'':cat.id)}
              style={{padding:"8px 14px",borderRadius:20,cursor:"pointer",border:(category===cat.id||(cat.id==='all'&&!category))?"2px solid #9d174d":"2px solid #e5e7eb",background:(category===cat.id||(cat.id==='all'&&!category))?"linear-gradient(135deg,#fdf2f8,#f3e8ff)":"white",color:(category===cat.id||(cat.id==='all'&&!category))?"#9d174d":"#555",fontSize:12,fontWeight:(category===cat.id||(cat.id==='all'&&!category))?700:500}}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        <div style={{flex:1}}>
          <label style={{display:"block",fontSize:11,color:"#888",fontWeight:600,marginBottom:4}}>{t.skinToneLabel}</label>
          <select value={skinTone} onChange={e=>setSkinTone(e.target.value)} style={{width:"100%",padding:"9px 10px",borderRadius:10,border:"1px solid #e5e7eb",fontSize:12,background:"white"}}>
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
          <select value={occasion} onChange={e=>setOccasion(e.target.value)} style={{width:"100%",padding:"9px 10px",borderRadius:10,border:"1px solid #e5e7eb",fontSize:12,background:"white"}}>
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
          {[["en","🇺🇸 EN"],["hi","🇮🇳 HI"],["pt","🇧🇷 PT"],["zh","🇨🇳 ZH"],["id","🇮🇩 ID"],["ng","🇳🇬 NG"]].map(([id,label])=>(
            <button key={id} onClick={()=>setLang(id)} style={{padding:"8px 14px",borderRadius:20,cursor:"pointer",border:lang===id?"2px solid #7c3aed":"2px solid #e5e7eb",background:lang===id?"#f5f3ff":"white",color:lang===id?"#7c3aed":"#555",fontSize:12,fontWeight:lang===id?700:500}}>{label}</button>
          ))}
        </div>
      </div>
      <div>
        <label style={{display:"block",fontSize:11,color:"#888",fontWeight:600,marginBottom:8}}>{t.shopInLabel}</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {[["","🌍 All"],["USA","🇺🇸 USA"],["India","🇮🇳 India"],["Brazil","🇧🇷 Brazil"],["Indonesia","🇮🇩 Indonesia"],["Nigeria","🇳🇬 Nigeria"],["China","🇨🇳 China"]].map(([val,label])=>(
            <button key={val} onClick={()=>setCountry(val)} style={{padding:"8px 14px",borderRadius:20,cursor:"pointer",border:country===val?"2px solid #7c3aed":"2px solid #e5e7eb",background:country===val?"#f5f3ff":"white",color:country===val?"#7c3aed":"#555",fontSize:12,fontWeight:country===val?700:500}}>{label}</button>
          ))}
        </div>
      </div>
    </div>

    {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:"12px 16px",color:"#dc2626",fontSize:13,marginBottom:12}}>⚠️ {error}</div>}

    <button onClick={handleFindMatch} disabled={!isReady||loading}
      style={{width:"100%",padding:"17px",fontSize:16,fontWeight:800,border:"none",borderRadius:16,cursor:!isReady||loading?"not-allowed":"pointer",background:!isReady||loading?"#e5e7eb":"linear-gradient(135deg,#9d174d,#7c3aed)",color:!isReady||loading?"#aaa":"white",boxShadow:isReady&&!loading?"0 6px 24px rgba(124,58,237,0.35)":"none",transition:"all 0.2s"}}>
      {loading?t.finding:isReady?t.findMatch:t.pickFirst}
    </button>

    {loading&&step&&<div style={{textAlign:"center",marginTop:10,color:"#7c3aed",fontSize:13,fontWeight:600}}>{step}</div>}

    <p style={{textAlign:"center",fontSize:11,color:"#bbb",marginTop:16}}>
      By using this app you agree to our <span onClick={()=>navigate('/Terms')} style={{color:"#9d174d",cursor:"pointer"}}>Terms & Conditions</span> including anonymous data collection for market research.
    </p>
  </div>
</div>
