import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Library() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("scans");
  const lib = (() => { try { return JSON.parse(localStorage.getItem('mmm_library') || '{"scans":[],"images":{}}'); } catch(e) { return {scans:[],images:{}}; } })();
  const scans = lib.scans || [];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff,#fce7f3)",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:"white",padding:"16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <button onClick={()=>navigate('/ColorScanner')} style={{background:"none",border:"1px solid #e5e7eb",borderRadius:20,padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#666",minHeight:44}}>← Scanner</button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>💄</span>
          <span style={{fontWeight:800,fontSize:16,background:"linear-gradient(135deg,#9d174d,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>My Library</span>
        </div>
        <div style={{width:60}}/>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"16px"}}>
        <div style={{display:"flex",background:"white",borderRadius:16,padding:4,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
          <button onClick={()=>setTab("scans")} style={{flex:1,padding:"10px",border:"none",borderRadius:12,cursor:"pointer",fontSize:13,fontWeight:600,background:tab==="scans"?"linear-gradient(135deg,#9d174d,#7c3aed)":"transparent",color:tab==="scans"?"white":"#666"}}>🎨 Scan History</button>
          <button onClick={()=>setTab("photos")} style={{flex:1,padding:"10px",border:"none",borderRadius:12,cursor:"pointer",fontSize:13,fontWeight:600,background:tab==="photos"?"linear-gradient(135deg,#9d174d,#7c3aed)":"transparent",color:tab==="photos"?"white":"#666"}}>📸 My Photos</button>
        </div>

        {tab==="scans"&&(
          scans.length===0 ? (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:48,marginBottom:16}}>🎨</div>
              <div style={{fontWeight:700,fontSize:16,color:"#999",marginBottom:8}}>No scans yet</div>
              <div style={{color:"#bbb",fontSize:13,marginBottom:24}}>Your scan history will appear here automatically</div>
              <button onClick={()=>navigate('/ColorScanner')} style={{background:"linear-gradient(135deg,#9d174d,#7c3aed)",color:"white",border:"none",borderRadius:16,padding:"14px 32px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start Scanning</button>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[...scans].reverse().map((scan,i)=>(
                <div key={i} style={{background:"white",borderRadius:16,padding:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:scan.color?.hex,flexShrink:0,boxShadow:`0 2px 8px ${scan.color?.hex}60`}}/>
                    <div>
                      <div style={{fontFamily:"monospace",fontWeight:700,fontSize:14}}>{scan.color?.hex}</div>
                      <div style={{fontSize:11,color:"#999"}}>{new Date(scan.date).toLocaleDateString()} · {scan.category||'all'}</div>
                    </div>
                  </div>
                  {scan.advice&&<div style={{fontSize:12,color:"#555",lineHeight:1.5,background:"#fdf2f8",borderRadius:10,padding:"8px 12px",wordBreak:"break-word",overflowWrap:"anywhere"}}>{scan.advice}</div>}
                </div>
              ))}
            </div>
          )
        )}

        {tab==="photos"&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:48,marginBottom:16}}>📸</div>
            <div style={{fontWeight:700,fontSize:16,color:"#999",marginBottom:8}}>Photo slots coming soon</div>
            <div style={{color:"#bbb",fontSize:13}}>Save reference photos of your face, lips and hands</div>
          </div>
        )}
      </div>
    </div>
  );
}
