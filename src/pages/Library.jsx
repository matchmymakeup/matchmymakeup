import { useState } from "react";
import { useNavigate } from "react-router-dom";

function getTrialInfo() {
  try {
    const start = localStorage.getItem('mmm_trial_start');
    if (!start) return false;
    return (7 - Math.floor((new Date() - new Date(start)) / 86400000)) > 0;
  } catch { return false; }
}

function loadStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}
function saveStore(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

const CATS = ['lipstick','foundation','blush','eyeshadow','nail_polish','mascara','highlighter','lip_liner'];
const tabBtn = (active) => ({
  flex:1,padding:"10px 4px",border:"none",borderRadius:12,cursor:"pointer",fontSize:12,fontWeight:600,minHeight:44,
  background:active?"#C9A96E":"transparent",color:active?"white":"#666"
});

export default function Library() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("scans");
  const isPremium = getTrialInfo();

  // Scan History
  const lib = loadStore('mmm_library', {scans:[],images:{}});
  const scans = lib.scans || [];
  const visibleScans = isPremium ? [...scans].reverse() : [...scans].reverse().slice(0, 10);

  // My Products
  const [myProducts, setMyProducts] = useState(() => loadStore('mmm_my_products', []));
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({name:'',brand:'',category:'lipstick',hex:'#FF6B9D',rating:5,notes:''});

  // My Shades
  const [myShades, setMyShades] = useState(() => loadStore('mmm_my_shades', []));
  const [showAddShade, setShowAddShade] = useState(false);
  const [newShade, setNewShade] = useState({name:'',hex:'#FF6B9D'});

  // My Looks
  const [myLooks, setMyLooks] = useState(() => loadStore('mmm_my_looks', []));
  const [showAddLook, setShowAddLook] = useState(false);
  const [newLook, setNewLook] = useState({name:'',occasion:'everyday',shades:[]});
  const [lookShadeHex, setLookShadeHex] = useState('#FF6B9D');

  function addProduct() {
    if (!newProduct.name) return;
    const updated = [...myProducts, {...newProduct, id: Date.now()}];
    setMyProducts(updated); saveStore('mmm_my_products', updated);
    setNewProduct({name:'',brand:'',category:'lipstick',hex:'#FF6B9D',rating:5,notes:''}); setShowAddProduct(false);
  }
  function removeProduct(id) {
    const updated = myProducts.filter(p => p.id !== id);
    setMyProducts(updated); saveStore('mmm_my_products', updated);
  }

  function addShade() {
    if (!newShade.name) return;
    const updated = [...myShades, {...newShade, id: Date.now()}];
    setMyShades(updated); saveStore('mmm_my_shades', updated);
    setNewShade({name:'',hex:'#FF6B9D'}); setShowAddShade(false);
  }
  function removeShade(id) {
    const updated = myShades.filter(s => s.id !== id);
    setMyShades(updated); saveStore('mmm_my_shades', updated);
  }

  function addLookShade() {
    if (newLook.shades.length >= 6) return;
    setNewLook(prev => ({...prev, shades: [...prev.shades, lookShadeHex]}));
  }
  function addLook() {
    if (!newLook.name || newLook.shades.length === 0) return;
    const updated = [...myLooks, {...newLook, id: Date.now()}];
    setMyLooks(updated); saveStore('mmm_my_looks', updated);
    setNewLook({name:'',occasion:'everyday',shades:[]}); setShowAddLook(false);
  }
  function removeLook(id) {
    const updated = myLooks.filter(l => l.id !== id);
    setMyLooks(updated); saveStore('mmm_my_looks', updated);
  }

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5-n);

  const premiumGate = (label) => (
    <div style={{textAlign:"center",padding:"48px 20px"}}>
      <div style={{fontSize:40,marginBottom:12}}>🔒</div>
      <div style={{fontWeight:700,fontSize:15,color:"#B76E79",marginBottom:6}}>Premium Feature</div>
      <div style={{color:"#888",fontSize:13,marginBottom:20,maxWidth:260,margin:"0 auto 20px"}}>{label}</div>
      <button onClick={()=>navigate('/MatchResults')} style={{background:"#C9A96E",color:"#1C1C1E",border:"none",borderRadius:16,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer",minHeight:44}}>
        Unlock Premium →
      </button>
    </div>
  );

  const inputStyle = {width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid #555',fontSize:14,marginBottom:8,background:'#3C3C3E',color:'#F5F0E8'};

  return (
    <div style={{minHeight:"100vh",background:"#1C1C1E",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:"#2C2C2E",padding:"16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <button onClick={()=>navigate('/ColorScanner')} style={{background:"none",border:"1px solid #555",borderRadius:20,padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#F5F0E8",minHeight:44}}>← Scanner</button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>💄</span>
          <span style={{fontWeight:800,fontSize:16,background:"#C9A96E",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>My Library</span>
        </div>
        <div style={{width:60}}/>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"16px"}}>
        {/* Tabs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",background:"#2C2C2E",borderRadius:16,padding:4,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",gap:2}}>
          <button onClick={()=>setTab("scans")} style={tabBtn(tab==="scans")}>🎨 Scans</button>
          <button onClick={()=>setTab("products")} style={tabBtn(tab==="products")}>{isPremium?'':'🔒 '}Products</button>
          <button onClick={()=>setTab("shades")} style={tabBtn(tab==="shades")}>{isPremium?'':'🔒 '}Shades</button>
          <button onClick={()=>setTab("looks")} style={tabBtn(tab==="looks")}>{isPremium?'':'🔒 '}Looks</button>
        </div>

        {/* SCAN HISTORY */}
        {tab==="scans"&&(
          scans.length===0 ? (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:48,marginBottom:16}}>🎨</div>
              <div style={{fontWeight:700,fontSize:16,color:"#999",marginBottom:8}}>No scans yet</div>
              <div style={{color:"#bbb",fontSize:13,marginBottom:24}}>Your scan history will appear here automatically</div>
              <button onClick={()=>navigate('/ColorScanner')} style={{background:"#C9A96E",color:"#1C1C1E",border:"none",borderRadius:16,padding:"14px 32px",fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Start Scanning</button>
            </div>
          ) : (
            <div>
              {!isPremium && scans.length > 10 && (
                <div style={{background:"#fef3c7",borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#92400e",fontWeight:600}}>
                  Showing last 10 scans. Premium unlocks your full history ({scans.length} scans).
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {visibleScans.map((scan,i)=>(
                  <div key={i} style={{background:"#2C2C2E",borderRadius:16,padding:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                      <div style={{width:40,height:40,borderRadius:"50%",background:scan.color?.hex,flexShrink:0,boxShadow:`0 2px 8px ${scan.color?.hex}60`}}/>
                      <div>
                        <div style={{fontFamily:"monospace",fontWeight:700,fontSize:14,color:"#F5F0E8"}}>{scan.color?.hex}</div>
                        <div style={{fontSize:12,color:"rgba(201,169,110,0.7)"}}>{new Date(scan.date).toLocaleDateString()} · {scan.category||'all'}</div>
                      </div>
                    </div>
                    {scan.advice&&<div style={{fontSize:12,color:"#F5F0E8",lineHeight:1.5,background:"#3C3C3E",borderRadius:10,padding:"8px 12px",wordBreak:"break-word",overflowWrap:"anywhere"}}>{scan.advice}</div>}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* MY PRODUCTS */}
        {tab==="products"&&(
          !isPremium ? premiumGate("Save products you own, rate them, and build your personal collection.") : (
            <div>
              <button onClick={()=>setShowAddProduct(true)} style={{width:"100%",padding:"14px",borderRadius:16,border:"2px dashed #C9A96E",background:"#2C2C2E",cursor:"pointer",fontSize:14,fontWeight:700,color:"#C9A96E",marginBottom:16,minHeight:44}}>+ Add Product</button>
              {myProducts.length===0 && <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa",fontSize:13}}>Add your first product to start building your collection</div>}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {myProducts.map(p => (
                  <div key={p.id} style={{background:"#2C2C2E",borderRadius:16,padding:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:"50%",background:p.hex,flexShrink:0}} />
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#F5F0E8"}}>{p.name}</div>
                        <div style={{fontSize:12,color:"rgba(201,169,110,0.7)"}}>{p.brand} · {p.category}</div>
                        <div style={{fontSize:14,color:"#fbbf24",marginTop:2}}>{stars(p.rating)}</div>
                      </div>
                      <button onClick={()=>removeProduct(p.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#ccc",padding:4}}>✕</button>
                    </div>
                    {p.notes && <div style={{fontSize:12,color:"#F5F0E8",marginTop:8,background:"#3C3C3E",borderRadius:8,padding:"6px 10px"}}>{p.notes}</div>}
                  </div>
                ))}
              </div>
              {showAddProduct && (
                <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                  <div onClick={()=>setShowAddProduct(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)"}} />
                  <div style={{position:"relative",background:"#2C2C2E",borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto"}}>
                    <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
                    <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,textAlign:"center",color:"#F5F0E8"}}>Add Product</h3>
                    <input placeholder="Product name" value={newProduct.name} onChange={e=>setNewProduct(p=>({...p,name:e.target.value}))} style={inputStyle} />
                    <input placeholder="Brand" value={newProduct.brand} onChange={e=>setNewProduct(p=>({...p,brand:e.target.value}))} style={inputStyle} />
                    <select value={newProduct.category} onChange={e=>setNewProduct(p=>({...p,category:e.target.value}))} style={inputStyle}>
                      {CATS.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                    </select>
                    <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                      <input type="color" value={newProduct.hex} onChange={e=>setNewProduct(p=>({...p,hex:e.target.value}))} style={{width:44,height:44,border:"none",borderRadius:10,cursor:"pointer"}} />
                      <input value={newProduct.hex} onChange={e=>setNewProduct(p=>({...p,hex:e.target.value}))} style={{...inputStyle,marginBottom:0,flex:1}} />
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:12,color:"#888",marginBottom:4}}>Rating</div>
                      <div style={{display:"flex",gap:4}}>{[1,2,3,4,5].map(n => (
                        <button key={n} onClick={()=>setNewProduct(p=>({...p,rating:n}))} style={{fontSize:24,background:"none",border:"none",cursor:"pointer",color:n<=newProduct.rating?"#fbbf24":"#e5e7eb"}}>{n<=newProduct.rating?'★':'☆'}</button>
                      ))}</div>
                    </div>
                    <textarea placeholder="Notes (optional)" value={newProduct.notes} onChange={e=>setNewProduct(p=>({...p,notes:e.target.value}))} style={{...inputStyle,height:60,resize:"none"}} />
                    <button onClick={addProduct} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"#C9A96E",color:"#1C1C1E",fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Save Product</button>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* MY SHADES */}
        {tab==="shades"&&(
          !isPremium ? premiumGate("Save your favourite hex codes with custom names and build a personal swatch library.") : (
            <div>
              <button onClick={()=>setShowAddShade(true)} style={{width:"100%",padding:"14px",borderRadius:16,border:"2px dashed #C9A96E",background:"#2C2C2E",cursor:"pointer",fontSize:14,fontWeight:700,color:"#C9A96E",marginBottom:16,minHeight:44}}>+ Save a Shade</button>
              {myShades.length===0 && <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa",fontSize:13}}>Save your first shade to start your swatch library</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {myShades.map(s => (
                  <div key={s.id} style={{background:"#2C2C2E",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",position:"relative"}}>
                    <button onClick={()=>removeShade(s.id)} style={{position:"absolute",top:4,right:4,background:"rgba(255,255,255,0.8)",border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",fontSize:12,color:"#999",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    <div style={{height:64,background:s.hex}} />
                    <div style={{padding:"8px 10px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#F5F0E8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                      <div style={{fontSize:11,color:"#888",fontFamily:"monospace"}}>{s.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
              {showAddShade && (
                <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                  <div onClick={()=>setShowAddShade(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)"}} />
                  <div style={{position:"relative",background:"#2C2C2E",borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:480}}>
                    <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
                    <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,textAlign:"center",color:"#F5F0E8"}}>Save a Shade</h3>
                    <input placeholder='e.g. "My everyday lip"' value={newShade.name} onChange={e=>setNewShade(s=>({...s,name:e.target.value}))} style={inputStyle} />
                    <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
                      <input type="color" value={newShade.hex} onChange={e=>setNewShade(s=>({...s,hex:e.target.value}))} style={{width:44,height:44,border:"none",borderRadius:10,cursor:"pointer"}} />
                      <input value={newShade.hex} onChange={e=>setNewShade(s=>({...s,hex:e.target.value}))} style={{...inputStyle,marginBottom:0,flex:1}} />
                    </div>
                    <div style={{width:"100%",height:48,borderRadius:12,background:newShade.hex,marginBottom:16}} />
                    <button onClick={addShade} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"#C9A96E",color:"#1C1C1E",fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Save Shade</button>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* MY LOOKS */}
        {tab==="looks"&&(
          !isPremium ? premiumGate("Create and save makeup looks by combining your saved shades with occasion tags.") : (
            <div>
              <button onClick={()=>setShowAddLook(true)} style={{width:"100%",padding:"14px",borderRadius:16,border:"2px dashed #C9A96E",background:"#2C2C2E",cursor:"pointer",fontSize:14,fontWeight:700,color:"#C9A96E",marginBottom:16,minHeight:44}}>+ Create a Look</button>
              {myLooks.length===0 && <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa",fontSize:13}}>Create your first look to save shade combinations</div>}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {myLooks.map(l => (
                  <div key={l.id} style={{background:"#2C2C2E",borderRadius:16,padding:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:"#F5F0E8"}}>{l.name}</div>
                        <div style={{fontSize:12,color:"rgba(201,169,110,0.7)",textTransform:"capitalize"}}>{l.occasion}</div>
                      </div>
                      <button onClick={()=>removeLook(l.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#ccc"}}>✕</button>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      {l.shades.map((hex,i) => (
                        <div key={i} style={{width:36,height:36,borderRadius:"50%",background:hex,border:"2px solid white",boxShadow:"0 2px 6px rgba(0,0,0,0.15)"}} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {showAddLook && (
                <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                  <div onClick={()=>setShowAddLook(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)"}} />
                  <div style={{position:"relative",background:"#2C2C2E",borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto"}}>
                    <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
                    <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,textAlign:"center",color:"#F5F0E8"}}>Create a Look</h3>
                    <input placeholder="Look name" value={newLook.name} onChange={e=>setNewLook(l=>({...l,name:e.target.value}))} style={inputStyle} />
                    <select value={newLook.occasion} onChange={e=>setNewLook(l=>({...l,occasion:e.target.value}))} style={inputStyle}>
                      {['everyday','office','evening','wedding','festival','editorial'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <div style={{fontSize:12,color:"#888",marginBottom:8}}>Add shades (up to 6)</div>
                    <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
                      <input type="color" value={lookShadeHex} onChange={e=>setLookShadeHex(e.target.value)} style={{width:44,height:44,border:"none",borderRadius:10,cursor:"pointer"}} />
                      <input value={lookShadeHex} onChange={e=>setLookShadeHex(e.target.value)} style={{...inputStyle,marginBottom:0,flex:1}} />
                      <button onClick={addLookShade} style={{padding:"10px 16px",borderRadius:10,border:"none",background:"#C9A96E",color:"#1C1C1E",fontWeight:700,cursor:"pointer",fontSize:13,minHeight:44}}>+</button>
                    </div>
                    {newLook.shades.length > 0 && (
                      <div style={{display:"flex",gap:6,marginBottom:16}}>
                        {newLook.shades.map((hex,i) => (
                          <div key={i} style={{width:36,height:36,borderRadius:"50%",background:hex,border:"2px solid white",boxShadow:"0 2px 6px rgba(0,0,0,0.15)",cursor:"pointer"}}
                            onClick={()=>setNewLook(l=>({...l,shades:l.shades.filter((_,j)=>j!==i)}))} />
                        ))}
                      </div>
                    )}
                    <button onClick={addLook} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"#C9A96E",color:"#1C1C1E",fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Save Look</button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
