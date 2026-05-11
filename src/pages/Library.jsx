import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isPremium } from "../lib/trial";
import { getSavedProducts, getSavedShades, saveProduct, saveShade, removeSavedProduct, removeSavedShade } from "../lib/storage";
import { supabase } from "../lib/supabase";
import PageBackBar from "../components/PageBackBar";
import { BG_WHITE, BG_OFFWHITE, INK_PRIMARY, INK_SECONDARY, ACCENT_BLACK, HAIRLINE, BORDER_ACTIVE, SHADOW } from "../lib/design-tokens";
import { TShirt, Briefcase, Sparkle, HighHeel, Sneaker, Boot } from "@phosphor-icons/react";

function loadStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}
function saveStore(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

// Phase 2 renamed the persisted scan date field to created_at; legacy localStorage
// entries from v1 may still carry .date. Fallback chain handles both; silent-fail
// on Invalid Date so cards render category-only rather than the literal string.
function formatScanDate(scan) {
  const raw = scan.created_at || scan.date || scan.timestamp;
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

const CATS = ['lipstick','foundation','blush','eyeshadow','nail_polish','mascara','highlighter','lip_liner','eyeliner','hair_colour','concealer','tinted_sunscreen','mineral_powder'];

const OUTFIT_TILES = [
  { label: 'Casual',  Icon: TShirt },
  { label: 'Office',  Icon: Briefcase },
  { label: 'Evening', Icon: Sparkle },
];
const SHOES_TILES = [
  { label: 'Heels',    Icon: HighHeel },
  { label: 'Sneakers', Icon: Sneaker },
  { label: 'Boots',    Icon: Boot },
];
const tabBtn = (active) => ({
  flexShrink:0,padding:"10px 14px",border:"none",borderRadius:12,cursor:"pointer",fontSize:12,fontWeight:600,minHeight:44,
  background:active?ACCENT_BLACK:"transparent",color:active?BG_WHITE:INK_SECONDARY
});

export default function Library() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("scans");
  const isPremiumUser = isPremium();

  // Scan History (out of scope for Step 5 — still localStorage)
  const lib = loadStore('mmm_library', {scans:[],images:{}});
  const scans = lib.scans || [];
  const visibleScans = isPremiumUser ? [...scans].reverse() : [...scans].reverse().slice(0, 10);

  // My Products (Step 5 — storage layer)
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({name:'',brand:'',category:'lipstick',hex:'#FF6B9D',rating:5,notes:''});

  // My Shades (Step 5 — storage layer)
  const [shades, setShades] = useState([]);
  const [showAddShade, setShowAddShade] = useState(false);
  const [newShade, setNewShade] = useState({name:'',hex:'#FF6B9D'});

  // Loading + error state for products + shades
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Migration error surfaced from AuthCallback (Step 6 Commit 2) via sessionStorage
  const [migrationError, setMigrationError] = useState(null);

  // My Looks (out of scope for Step 5 — still localStorage)
  const [myLooks, setMyLooks] = useState(() => loadStore('mmm_my_looks', []));
  const [showAddLook, setShowAddLook] = useState(false);
  const [newLook, setNewLook] = useState({name:'',occasion:'everyday',shades:[]});
  const [lookShadeHex, setLookShadeHex] = useState('#FF6B9D');

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [productsResult, shadesResult] = await Promise.all([
        getSavedProducts(),
        getSavedShades(),
      ]);
      const sortedProducts = (productsResult || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const sortedShades = (shadesResult || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setProducts(sortedProducts);
      setShades(sortedShades);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (sortedProducts.length === 0) {
          console.warn("[Library] Authed user returned 0 rows from saved_products — possible RLS misconfig or genuinely empty Library");
        }
        if (sortedShades.length === 0) {
          console.warn("[Library] Authed user returned 0 rows from saved_shades — possible RLS misconfig or genuinely empty Library");
        }
      }
    } catch (err) {
      console.error('[Library] load failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    // Surface migration failure from AuthCallback if present, then clear flag
    const migErr = sessionStorage.getItem('mmm_migration_error');
    if (migErr) {
      setMigrationError(migErr);
      sessionStorage.removeItem('mmm_migration_error');
    }

    // Wait for session hydration before first read to avoid race with storage.js cache
    supabase.auth.getSession().then(() => {
      if (!cancelled) loadAll();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadAll();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function addProduct() {
    if (!newProduct.name) return;
    try {
      await saveProduct(newProduct);
      await loadAll();
      setNewProduct({name:'',brand:'',category:'lipstick',hex:'#FF6B9D',rating:5,notes:''});
      setShowAddProduct(false);
    } catch (err) {
      console.error('[Library] saveProduct failed:', err);
      alert('Could not save product. Try again.');
    }
  }
  async function removeProduct(id) {
    try {
      await removeSavedProduct(id);
      await loadAll();
    } catch (err) {
      console.error('[Library] removeSavedProduct failed:', err);
    }
  }

  async function addShade() {
    if (!newShade.name) return;
    try {
      await saveShade(newShade);
      await loadAll();
      setNewShade({name:'',hex:'#FF6B9D'});
      setShowAddShade(false);
    } catch (err) {
      console.error('[Library] saveShade failed:', err);
      alert('Could not save shade. Try again.');
    }
  }
  async function removeShade(id) {
    try {
      await removeSavedShade(id);
      await loadAll();
    } catch (err) {
      console.error('[Library] removeSavedShade failed:', err);
    }
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
      <div style={{fontWeight:700,fontSize:15,color:INK_PRIMARY,marginBottom:6}}>Premium Feature</div>
      <div style={{color:"#888",fontSize:13,marginBottom:20,maxWidth:260,margin:"0 auto 20px"}}>{label}</div>
      <button onClick={()=>navigate('/MatchResults')} style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:16,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer",minHeight:44}}>
        Unlock Premium →
      </button>
    </div>
  );

  const inputStyle = {width:'100%',padding:'10px 12px',borderRadius:10,border:`1px solid ${HAIRLINE}`,fontSize:14,marginBottom:8,background:BG_OFFWHITE,color:INK_PRIMARY};

  return (
    <div style={{minHeight:"100vh",background:BG_WHITE,fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"16px"}}>
        {/* Uses shared <PageBackBar/> — see src/components/PageBackBar.jsx */}
        {migrationError && (
          <div style={{background:'#3C1F1F',color:'#F5D8D8',padding:'12px 14px',borderRadius:12,marginBottom:12,fontSize:13,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <span>Some saved items couldn't be restored from this device.</span>
            <button onClick={() => setMigrationError(null)} style={{background:'none',border:'none',color:'#F5D8D8',cursor:'pointer',fontSize:18,minWidth:32,minHeight:32,padding:0}}>✕</button>
          </div>
        )}
        <PageBackBar onBack={() => navigate('/ColorScanner')} label="← Scanner" title="💄 My Library" />
        {/* Tabs — explicit two-row structure, row 2 indented for visual balance */}
        <div style={{
          background: BG_OFFWHITE,
          borderRadius: 16,
          padding: 8,
          marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}>
          <div style={{display:'flex', gap:8, marginBottom:8, justifyContent:'center'}}>
            <button onClick={()=>setTab("scans")} style={{...tabBtn(tab==="scans"),whiteSpace:"nowrap"}}>🎨 Scans</button>
            <button onClick={()=>setTab("products")} style={{...tabBtn(tab==="products"),whiteSpace:"nowrap"}}>{!isPremiumUser && <span style={{marginLeft:4,marginRight:4}}>🔒</span>}Products</button>
            <button onClick={()=>setTab("shades")} style={{...tabBtn(tab==="shades"),whiteSpace:"nowrap"}}>{!isPremiumUser && <span style={{marginLeft:4,marginRight:4}}>🔒</span>}Shades</button>
          </div>
          <div style={{display:'flex', gap:8, justifyContent:'center'}}>
            <button onClick={()=>setTab("looks")} style={{...tabBtn(tab==="looks"),whiteSpace:"nowrap"}}>{!isPremiumUser && <span style={{marginLeft:4,marginRight:4}}>🔒</span>}Looks</button>
            <button onClick={()=>setTab("outfit")} style={{...tabBtn(tab==="outfit"),whiteSpace:"nowrap"}}>👗 Outfit</button>
            <button onClick={()=>setTab("shoes")} style={{...tabBtn(tab==="shoes"),whiteSpace:"nowrap"}}>👠 Shoes</button>
            <button onClick={()=>setTab("hair")} style={{...tabBtn(tab==="hair"),whiteSpace:"nowrap"}}>💇 Hair</button>
          </div>
        </div>

        {/* SCAN HISTORY */}
        {tab==="scans"&&(
          scans.length===0 ? (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:48,marginBottom:16}}>🎨</div>
              <div style={{fontWeight:700,fontSize:16,color:"#999",marginBottom:8}}>No scans yet</div>
              <div style={{color:"#bbb",fontSize:13,marginBottom:24}}>Your scan history will appear here automatically</div>
              <button onClick={()=>navigate('/ColorScanner')} style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:16,padding:"14px 32px",fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Start Scanning</button>
            </div>
          ) : (
            <div>
              {!isPremiumUser && scans.length > 10 && (
                <div style={{background:BG_OFFWHITE,border:`1px solid ${HAIRLINE}`,borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:12,color:INK_PRIMARY,fontWeight:600}}>
                  Showing last 10 scans. Premium unlocks your full history ({scans.length} scans).
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {visibleScans.map((scan,i)=>(
                  <div key={i} style={{background:BG_OFFWHITE,borderRadius:16,padding:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                      <div style={{width:40,height:40,borderRadius:"50%",background:scan.color?.hex,flexShrink:0,boxShadow:`0 2px 8px ${scan.color?.hex}60`}}/>
                      <div>
                        <div style={{fontFamily:"monospace",fontWeight:700,fontSize:14,color:INK_PRIMARY}}>{scan.color?.hex}</div>
                        <div style={{fontSize:12,color:INK_SECONDARY}}>{[formatScanDate(scan), scan.category || 'all'].filter(Boolean).join(' · ')}</div>
                      </div>
                    </div>
                    {scan.advice&&<div style={{fontSize:12,color:INK_PRIMARY,lineHeight:1.5,background:BG_OFFWHITE,borderRadius:10,padding:"8px 12px",wordBreak:"break-word",overflowWrap:"anywhere"}}>{scan.advice}</div>}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* MY PRODUCTS */}
        {tab==="products"&&(
          !isPremiumUser ? premiumGate("Save products you own, rate them, and build your personal collection.") : (
            <div>
              <button onClick={()=>setShowAddProduct(true)} style={{width:"100%",padding:"14px",borderRadius:16,border:`2px dashed ${HAIRLINE}`,background:BG_OFFWHITE,cursor:"pointer",fontSize:14,fontWeight:700,color:INK_PRIMARY,marginBottom:16,minHeight:44}}>+ Add Product</button>
              {loading && <p style={{textAlign:"center",padding:20,color:"#888",fontSize:13}}>Loading…</p>}
              {error && (
                <div style={{textAlign:"center",padding:20}}>
                  <p style={{color:"#dc2626",marginBottom:8,fontSize:13}}>Couldn't load — tap to retry</p>
                  <button onClick={loadAll} style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:14,padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer",minHeight:44}}>Retry</button>
                </div>
              )}
              {!loading && !error && products.length === 0 && (
                <div style={{textAlign:"center",padding:"40px 20px"}}>
                  <p style={{color:"#aaa",fontSize:13,marginBottom:12}}>No saved products yet</p>
                  <button onClick={()=>navigate('/MatchResults')} style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:14,padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer",minHeight:44}}>Browse products</button>
                  {/* TODO Step 6: show migration hint for authed users with localStorage entries */}
                </div>
              )}
              {!loading && !error && products.length > 0 && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {products.map(p => (
                  <div key={p.id} style={{background:BG_OFFWHITE,borderRadius:16,padding:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:"50%",background:p.hex,flexShrink:0}} />
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:INK_PRIMARY}}>{p.name}</div>
                        <div style={{fontSize:12,color:INK_SECONDARY}}>{p.brand} · {p.category}</div>
                        {p.rating != null && p.rating > 0 && (
                          <div style={{fontSize:14,color:"#fbbf24",marginTop:2}}>{stars(p.rating)}</div>
                        )}
                      </div>
                      <button onClick={()=>removeProduct(p.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#ccc",padding:4}}>✕</button>
                    </div>
                    {p.notes && p.notes.trim().length > 0 && <div style={{fontSize:12,color:INK_PRIMARY,marginTop:8,background:BG_OFFWHITE,borderRadius:8,padding:"6px 10px"}}>{p.notes}</div>}
                  </div>
                ))}
              </div>
              )}
              {showAddProduct && (
                <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                  <div onClick={()=>setShowAddProduct(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)"}} />
                  <div style={{position:"relative",background:BG_OFFWHITE,borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto"}}>
                    <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
                    <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,textAlign:"center",color:INK_PRIMARY}}>Add Product</h3>
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
                    <button onClick={addProduct} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:ACCENT_BLACK,color:BG_WHITE,fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Save Product</button>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* MY SHADES */}
        {tab==="shades"&&(
          !isPremiumUser ? premiumGate("Save your favourite hex codes with custom names and build a personal swatch library.") : (
            <div>
              <button onClick={()=>setShowAddShade(true)} style={{width:"100%",padding:"14px",borderRadius:16,border:`2px dashed ${HAIRLINE}`,background:BG_OFFWHITE,cursor:"pointer",fontSize:14,fontWeight:700,color:INK_PRIMARY,marginBottom:16,minHeight:44}}>+ Save a Shade</button>
              {loading && <p style={{textAlign:"center",padding:20,color:"#888",fontSize:13}}>Loading…</p>}
              {error && (
                <div style={{textAlign:"center",padding:20}}>
                  <p style={{color:"#dc2626",marginBottom:8,fontSize:13}}>Couldn't load — tap to retry</p>
                  <button onClick={loadAll} style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:14,padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer",minHeight:44}}>Retry</button>
                </div>
              )}
              {!loading && !error && shades.length === 0 && (
                <div style={{textAlign:"center",padding:"40px 20px"}}>
                  <p style={{color:"#aaa",fontSize:13,marginBottom:12}}>No saved shades yet</p>
                  <button onClick={()=>navigate('/')} style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:14,padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer",minHeight:44}}>Start scanning</button>
                  {/* TODO Step 6: show migration hint for authed users with localStorage entries */}
                </div>
              )}
              {!loading && !error && shades.length > 0 && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {shades.map(s => (
                  <div key={s.id} style={{background:BG_OFFWHITE,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",position:"relative"}}>
                    <button onClick={()=>removeShade(s.id)} style={{position:"absolute",top:4,right:4,background:ACCENT_BLACK,border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",fontSize:12,color:BG_WHITE,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    <div style={{height:64,background:s.hex}} />
                    <div style={{padding:"8px 10px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:INK_PRIMARY,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                      <div style={{fontSize:11,color:"#888",fontFamily:"monospace"}}>{s.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
              )}
              {showAddShade && (
                <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                  <div onClick={()=>setShowAddShade(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)"}} />
                  <div style={{position:"relative",background:BG_OFFWHITE,borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:480}}>
                    <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
                    <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,textAlign:"center",color:INK_PRIMARY}}>Save a Shade</h3>
                    <input placeholder='e.g. "My everyday lip"' value={newShade.name} onChange={e=>setNewShade(s=>({...s,name:e.target.value}))} style={inputStyle} />
                    <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
                      <input type="color" value={newShade.hex} onChange={e=>setNewShade(s=>({...s,hex:e.target.value}))} style={{width:44,height:44,border:"none",borderRadius:10,cursor:"pointer"}} />
                      <input value={newShade.hex} onChange={e=>setNewShade(s=>({...s,hex:e.target.value}))} style={{...inputStyle,marginBottom:0,flex:1}} />
                    </div>
                    <div style={{width:"100%",height:48,borderRadius:12,background:newShade.hex,marginBottom:16}} />
                    <button onClick={addShade} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:ACCENT_BLACK,color:BG_WHITE,fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Save Shade</button>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* MY LOOKS */}
        {tab==="looks"&&(
          !isPremiumUser ? premiumGate("Create and save makeup looks by combining your saved shades with occasion tags.") : (
            <div>
              <button onClick={()=>setShowAddLook(true)} style={{width:"100%",padding:"14px",borderRadius:16,border:`2px dashed ${HAIRLINE}`,background:BG_OFFWHITE,cursor:"pointer",fontSize:14,fontWeight:700,color:INK_PRIMARY,marginBottom:16,minHeight:44}}>+ Create a Look</button>
              {myLooks.length===0 && <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa",fontSize:13}}>Create your first look to save shade combinations</div>}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {myLooks.map(l => (
                  <div key={l.id} style={{background:BG_OFFWHITE,borderRadius:16,padding:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:INK_PRIMARY}}>{l.name}</div>
                        <div style={{fontSize:12,color:INK_SECONDARY,textTransform:"capitalize"}}>{l.occasion}</div>
                      </div>
                      <button onClick={()=>removeLook(l.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#ccc"}}>✕</button>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      {l.shades.map((hex,i) => (
                        <div key={i} style={{width:36,height:36,borderRadius:"50%",background:hex,border:`1px solid ${HAIRLINE}`,boxShadow:"0 2px 6px rgba(0,0,0,0.15)"}} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {showAddLook && (
                <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                  <div onClick={()=>setShowAddLook(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)"}} />
                  <div style={{position:"relative",background:BG_OFFWHITE,borderRadius:"24px 24px 0 0",padding:"24px 16px 32px",width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto"}}>
                    <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}} />
                    <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,textAlign:"center",color:INK_PRIMARY}}>Create a Look</h3>
                    <input placeholder="Look name" value={newLook.name} onChange={e=>setNewLook(l=>({...l,name:e.target.value}))} style={inputStyle} />
                    <select value={newLook.occasion} onChange={e=>setNewLook(l=>({...l,occasion:e.target.value}))} style={inputStyle}>
                      {['everyday','office','evening','wedding','festival','editorial'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <div style={{fontSize:12,color:"#888",marginBottom:8}}>Add shades (up to 6)</div>
                    <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
                      <input type="color" value={lookShadeHex} onChange={e=>setLookShadeHex(e.target.value)} style={{width:44,height:44,border:"none",borderRadius:10,cursor:"pointer"}} />
                      <input value={lookShadeHex} onChange={e=>setLookShadeHex(e.target.value)} style={{...inputStyle,marginBottom:0,flex:1}} />
                      <button onClick={addLookShade} style={{padding:"10px 16px",borderRadius:10,border:"none",background:ACCENT_BLACK,color:BG_WHITE,fontWeight:700,cursor:"pointer",fontSize:13,minHeight:44}}>+</button>
                    </div>
                    {newLook.shades.length > 0 && (
                      <div style={{display:"flex",gap:6,marginBottom:16}}>
                        {newLook.shades.map((hex,i) => (
                          <div key={i} style={{width:36,height:36,borderRadius:"50%",background:hex,border:`1px solid ${HAIRLINE}`,boxShadow:"0 2px 6px rgba(0,0,0,0.15)",cursor:"pointer"}}
                            onClick={()=>setNewLook(l=>({...l,shades:l.shades.filter((_,j)=>j!==i)}))} />
                        ))}
                      </div>
                    )}
                    <button onClick={addLook} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:ACCENT_BLACK,color:BG_WHITE,fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Save Look</button>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* MATCH MY OUTFIT — Premium+ */}
        {tab==="outfit"&&(
          <div style={{textAlign:"center",padding:"32px 16px"}}>
            <div style={{background:BG_OFFWHITE,borderRadius:20,padding:"32px 20px",border:`1px solid ${HAIRLINE}`}}>
              <div style={{fontSize:48,marginBottom:12}}>🔒</div>
              <div style={{fontSize:10,color:INK_PRIMARY,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Premium+ Feature</div>
              <div style={{fontWeight:800,fontSize:18,color:INK_PRIMARY,marginBottom:8}}>Match My Outfit</div>
              <div style={{color:"#888",fontSize:13,lineHeight:1.6,marginBottom:24,maxWidth:280,margin:"0 auto 24px"}}>Upload photos of your outfits and get makeup recommendations that perfectly complement your look</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>
                {OUTFIT_TILES.map(({label, Icon}) => (
                  <div key={label} style={{background:BG_OFFWHITE,borderRadius:14,padding:"20px 8px",border:"1px dashed #555"}}>
                    <div style={{marginBottom:6,lineHeight:0}}>
                      <Icon size={32} weight="light" color={INK_SECONDARY} />
                    </div>
                    <div style={{fontSize:11,color:"#666",fontWeight:600}}>{label}</div>
                  </div>
                ))}
              </div>
              <button style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:16,padding:"14px 32px",fontSize:14,fontWeight:700,cursor:"pointer",minHeight:44,boxShadow:SHADOW}}>
                Upgrade to Premium+
              </button>
            </div>
          </div>
        )}

        {/* MATCH MY SHOES — Premium+ */}
        {tab==="shoes"&&(
          <div style={{textAlign:"center",padding:"32px 16px"}}>
            <div style={{background:BG_OFFWHITE,borderRadius:20,padding:"32px 20px",border:`1px solid ${HAIRLINE}`}}>
              <div style={{fontSize:48,marginBottom:12}}>🔒</div>
              <div style={{fontSize:10,color:INK_PRIMARY,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Premium+ Feature</div>
              <div style={{fontWeight:800,fontSize:18,color:INK_PRIMARY,marginBottom:8}}>Match My Shoes</div>
              <div style={{color:"#888",fontSize:13,lineHeight:1.6,marginBottom:24,maxWidth:280,margin:"0 auto 24px"}}>Photograph your shoe collection and find nail polish and lip colours that match perfectly</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>
                {SHOES_TILES.map(({label, Icon}) => (
                  <div key={label} style={{background:BG_OFFWHITE,borderRadius:14,padding:"20px 8px",border:"1px dashed #555"}}>
                    <div style={{marginBottom:6,lineHeight:0}}>
                      <Icon size={32} weight="light" color={INK_SECONDARY} />
                    </div>
                    <div style={{fontSize:11,color:"#666",fontWeight:600}}>{label}</div>
                  </div>
                ))}
              </div>
              <button style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:16,padding:"14px 32px",fontSize:14,fontWeight:700,cursor:"pointer",minHeight:44,boxShadow:SHADOW}}>
                Upgrade to Premium+
              </button>
            </div>
          </div>
        )}

        {/* MATCH MY HAIR — Premium+ */}
        {tab==="hair"&&(
          <div style={{textAlign:"center",padding:"32px 16px"}}>
            <div style={{background:BG_OFFWHITE,borderRadius:20,padding:"32px 20px",border:`1px solid ${HAIRLINE}`}}>
              <div style={{fontSize:48,marginBottom:12}}>🔒</div>
              <div style={{fontSize:10,color:INK_PRIMARY,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Premium+ Feature</div>
              <div style={{fontWeight:800,fontSize:18,color:INK_PRIMARY,marginBottom:8}}>Match My Hair</div>
              <div style={{color:"#888",fontSize:13,lineHeight:1.6,marginBottom:24,maxWidth:280,margin:"0 auto 24px"}}>Scan your hair colour or choose a new shade and get perfectly coordinated makeup looks</div>
              {/* Hair-colour swatch array — chromatic content per Artefact 2 §7.2
                  carve-out (classification swatches). #1C1C1E here represents very
                  dark hair, not page chrome. */}
              <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:24,flexWrap:"wrap"}}>
                {['#1C1C1E','#3B1F0A','#8B6914','#C8A951','#D4A76A','#8B3A3A'].map(hex => (
                  <div key={hex} style={{width:40,height:40,borderRadius:"50%",background:hex,border:"2px solid #555",boxShadow:`0 2px 8px ${hex}40`}} />
                ))}
              </div>
              <button style={{background:ACCENT_BLACK,color:BG_WHITE,border:"none",borderRadius:16,padding:"14px 32px",fontSize:14,fontWeight:700,cursor:"pointer",minHeight:44,boxShadow:SHADOW}}>
                Upgrade to Premium+
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
