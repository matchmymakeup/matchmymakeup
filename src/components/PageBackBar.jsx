// i18n note (Phase 5+): label and title currently passed as English strings.
// When chrome i18n pass happens, add label/title keys to T table in MatchResults
// (16 languages) and apply same pattern to other Header-included pages.

export default function PageBackBar({ onBack, label, title }) {
  return (
    <>
      <div style={{padding:'8px 0 4px 0'}}>
        <button
          onClick={onBack}
          style={{background:'none',border:'none',padding:0,fontSize:12,color:'#C9A96E',cursor:'pointer',fontWeight:600,fontFamily:"'Segoe UI',sans-serif"}}
        >
          {label}
        </button>
      </div>
      <h1 style={{margin:'0 0 16px',fontSize:22,fontWeight:800,color:'#F5F0E8'}}>{title}</h1>
    </>
  )
}
