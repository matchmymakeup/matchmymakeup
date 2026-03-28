import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const LIBRARY_KEY = 'mmm_library';

const IMAGE_SLOTS = [
  { id: 'face', label: 'Face Photo', emoji: '🙂', hint: 'For lip color & blush try-on', requirements: ['✅ Face centered in frame','✅ Well lit — natural or bright light','✅ No glasses or sunglasses','✅ Hair away from face','✅ Neutral expression, look at camera','❌ No filters or heavy editing','❌ No hats or face coverings'], example: '💡 Passport-style photo works perfectly' },
  { id: 'lips', label: 'Lips Close-Up', emoji: '💋', hint: 'For precise lipstick matching', requirements: ['✅ Fill frame with just your lips','✅ Well lit — no shadows','✅ Bare lips (no lipstick or gloss)','✅ Sharp focus, not blurry','❌ No filters or color adjustments'], example: '💡 Hold phone 20cm from your lips' },
  { id: 'hands', label: 'Hand Photo', emoji: '💅', hint: 'For nail polish color matching', requirements: ['✅ Single hand, palm facing down','✅ All five fingers visible and spread','✅ Well lit — no shadows on nails','✅ Bare nails (no existing polish)','✅ Rest hand on white paper','❌ No rings or jewellery','❌ No filters'], example: '💡 Rest hand on white paper in natural light' },
];

function getLibrary() {
  try { return JSON.parse(localStorage.getItem(LIBRARY_KEY) || '{"scans":[],"images":{}}'); }
  catch { return { scans: [], images: {} }; }
}
function saveLibrary(lib) { localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib)); }

export default function LibraryPage() {
  const navigate = useNavigate();
  const [library, setLibrary] = useState(getLibrary());
  const [activeTab, setActiveTab] = useState('scans');
  const [expandedSlot, setExpandedSlot] = useState(null);
  const fileRefs = { face: useRef(), lips: useRef(), hands: useRef() };

  useEffect(() => { setLibrary(getLibrary()); }, []);

  function handleImageUpload(slotId, e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const lib = getLibrary();
      lib.images = lib.images || {};
      lib.images[slotId] = { dataUrl: ev.target.result, name: file.name, date: new Date().toISOString() };
      saveLibrary(lib);
      setLibrary({ ...lib });
      setExpandedSlot(null);
    };
    reader.readAsDataURL(file);
  }

  function removeImage(slotId) {
    const lib = getLibrary();
    delete lib.images[slotId];
    saveLibrary(lib);
    setLibrary({ ...lib });
  }

  function removeScan(index) {
    const lib = getLibrary();
    lib.scans.splice(index, 1);
    saveLibrary(lib);
    setLibrary({ ...lib });
  }

  const scans = library.scans || [];
  const images = library.images || {};

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#fdf2f8,#f3e8ff,#fce7f3)',fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:'white',padding:'16px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{maxWidth:560,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={()=>navigate('/ColorScanner')} style={{background:'none',border:'1px solid #e5e7eb',borderRadius:10,padding:'8px 14px',cursor:'pointer',fontSize:13,color:'#666',fontWeight:600}}>← Scanner</button>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:20}}>💄</span>
            <span style={{fontWeight:800,fontSize:16,background:'linear-gradient(135deg,#9d174d,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>My Library</span>
          </div>
          <div style={{width:70}}/>
        </div>
      </div>

      <div style={{maxWidth:560,margin:'0 auto',padding:'20px 16px 60px'}}>
        <div style={{display:'flex',background:'white',borderRadius:16,padding:4,marginBottom:20,boxShadow:'0 2px 12px rgba(0,0,0,0.07)'}}>
          {[['scans','🎨 Scan History'],['images','📷 My Photos']].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)} style={{flex:1,padding:'10px 4px',border:'none',borderRadius:12,cursor:'pointer',fontSize:13,fontWeight:600,background:activeTab===id?'linear-gradient(135deg,#9d174d,#7c3aed)':'transparent',color:activeTab===id?'white':'#666'}}>
              {label}
            </button>
          ))}
        </div>

        {activeTab==='scans'&&(
          <div>
            {scans.length===0?(
              <div style={{textAlign:'center',padding:'48px 0',color:'#aaa'}}>
                <div style={{fontSize:48,marginBottom:12}}>🎨</div>
                <p style={{fontSize:15,fontWeight:600,marginBottom:4}}>No scans yet</p>
                <p style={{fontSize:13}}>Your scan history will appear here automatically</p>
                <button onClick={()=>navigate('/ColorScanner')} style={{marginTop:20,background:'linear-gradient(135deg,#9d174d,#7c3aed)',color:'white',border:'none',borderRadius:14,padding:'12px 28px',fontSize:14,fontWeight:700,cursor:'pointer'}}>
                  Start Scanning
                </button>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {scans.slice().reverse().map((scan,i)=>(
                  <div key={i} style={{background:'white',borderRadius:20,padding:16,boxShadow:'0 4px 16px rgba(0,0,0,0.07)',display:'flex',gap:14,alignItems:'flex-start'}}>
                    <div style={{width:52,height:52,borderRadius:'50%',background:scan.color?.hex,flexShrink:0,boxShadow:`0 4px 12px ${scan.color?.hex}60`}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:'monospace',fontWeight:800,fontSize:16,color:'#111'}}>{scan.color?.hex}</div>
                      <div style={{fontSize:12,color:'#888',marginTop:4,display:'flex',gap:4,flexWrap:'wrap'}}>
                        {scan.skinTone&&<span style={{background:'#fdf2f8',color:'#9d174d',borderRadius:20,padding:'2px 8px',fontSize:11}}>{scan.skinTone}</span>}
                        {scan.occasion&&<span style={{background:'#f3e8ff',color:'#7c3aed',borderRadius:20,padding:'2px 8px',fontSize:11}}>{scan.occasion}</span>}
                        {scan.country&&<span style={{background:'#ecfdf5',color:'#065f46',borderRadius:20,padding:'2px 8px',fontSize:11}}>{scan.country}</span>}
                      </div>
                      {scan.advice&&<p style={{fontSize:12,color:'#666',marginTop:6,lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{scan.advice}</p>}
                      <div style={{fontSize:11,color:'#bbb',marginTop:4}}>{new Date(scan.date).toLocaleDateString()}</div>
                    </div>
                    <button onClick={()=>removeScan(scans.length-1-i)} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:'#ddd',padding:4,flexShrink:0}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab==='images'&&(
          <div>
            <div style={{background:'linear-gradient(135deg,#fdf2f8,#f3e8ff)',border:'1px solid #f9a8d4',borderRadius:16,padding:16,marginBottom:20,fontSize:13,color:'#9d174d',lineHeight:1.6}}>
              <strong>📸 Why photo quality matters:</strong> Accurate reference photos give you more precise color matches and better virtual try-on results.
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {IMAGE_SLOTS.map(slot=>{
                const saved=images[slot.id];
                const isExpanded=expandedSlot===slot.id;
                return (
                  <div key={slot.id} style={{background:'white',borderRadius:20,padding:16,boxShadow:'0 4px 16px rgba(0,0,0,0.07)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                      <div style={{width:44,height:44,borderRadius:'50%',background:saved?'linear-gradient(135deg,#9d174d,#7c3aed)':'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                        {saved?'✅':slot.emoji}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,color:'#111',fontSize:15}}>{slot.label}</div>
                        <div style={{fontSize:12,color:'#aaa'}}>{slot.hint}</div>
                      </div>
                      {saved&&<button onClick={()=>removeImage(slot.id)} style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',borderRadius:10,padding:'4px 10px',cursor:'pointer',fontSize:11,fontWeight:600}}>Remove</button>}
                    </div>
                    {saved?(
                      <div>
                        <img src={saved.dataUrl} alt={slot.label} style={{width:'100%',borderRadius:14,maxHeight:220,objectFit:'cover'}}/>
                        <div style={{fontSize:11,color:'#aaa',marginTop:6,textAlign:'center'}}>✅ Saved {new Date(saved.date).toLocaleDateString()} · Stored on device only</div>
                      </div>
                    ):(
                      <div>
                        <button onClick={()=>setExpandedSlot(isExpanded?null:slot.id)}
                          style={{width:'100%',background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:12,padding:'10px 14px',cursor:'pointer',fontSize:12,fontWeight:600,color:'#555',textAlign:'left',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span>📋 Photo requirements</span><span>{isExpanded?'▲':'▼'}</span>
                        </button>
                        {isExpanded&&(
                          <div style={{background:'#f9fafb',borderRadius:12,padding:14,marginBottom:12}}>
                            {slot.requirements.map((req,i)=>(
                              <div key={i} style={{fontSize:12,color:req.startsWith('❌')?'#dc2626':'#374151',lineHeight:1.8}}>{req}</div>
                            ))}
                            <div style={{marginTop:10,fontSize:12,color:'#7c3aed',fontWeight:600,background:'#f3e8ff',borderRadius:8,padding:'6px 10px'}}>{slot.example}</div>
                          </div>
                        )}
                        <div onClick={()=>fileRefs[slot.id].current?.click()}
                          style={{border:'2px dashed #C2185B',borderRadius:14,padding:'20px 16px',textAlign:'center',cursor:'pointer',background:'#fdf2f8'}}>
                          <div style={{fontSize:28,marginBottom:6}}>📷</div>
                          <div style={{fontSize:13,color:'#9d174d',fontWeight:700}}>Upload {slot.label}</div>
                          <div style={{fontSize:11,color:'#aaa',marginTop:4}}>JPG · PNG · WEBP</div>
                        </div>
                      </div>
                    )}
                    <input ref={fileRefs[slot.id]} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleImageUpload(slot.id,e)}/>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:20,background:'white',border:'1px solid #e5e7eb',borderRadius:16,padding:16,fontSize:12,color:'#666',lineHeight:1.8}}>
              <strong style={{color:'#111'}}>🔒 Privacy:</strong> Your photos are stored only on your device and never uploaded to our servers. See our <span onClick={()=>navigate('/Terms')} style={{color:'#7c3aed',cursor:'pointer',textDecoration:'underline'}}>Terms & Conditions</span>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
