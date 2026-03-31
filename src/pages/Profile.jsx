import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ETHNICITIES = ['East Asian','South Asian','Southeast Asian','Middle Eastern','Black/African','Latino/Hispanic','White/European','Mixed','Prefer not to say'];
const SKIN_CONCERNS = ['Acne','Hyperpigmentation','Dryness','Oiliness','Ageing','Sensitivity','Uneven tone'];
const BEAUTY_GOALS = ['Natural everyday','Bold glam','Professional/office','Bridal/special occasion','Editorial/creative','Eco-conscious'];
const BUDGETS = ['Under $10','$10-25','$25-50','$50-100','$100+'];
const CLIMATES = ['Tropical','Humid','Dry','Temperate','Cold'];
const AGE_RANGES = ['Under 18','18-24','25-34','35-44','45-54','55+'];
const SKIN_TONES = [
  { id:'fair', label:'🤍 Fair' },{ id:'light', label:'🍑 Light' },{ id:'medium', label:'🌼 Medium' },
  { id:'tan', label:'🌻 Tan' },{ id:'deep', label:'🤎 Deep' },{ id:'deep+', label:'🖤 Deep+' },
];

function getProfile() {
  try { return JSON.parse(localStorage.getItem('mmm_profile') || '{}'); } catch { return {}; }
}

const SECTIONS = [
  { key:'ageRange', label:'Age Range', reward:'Age-matched advice' },
  { key:'ethnicity', label:'Ethnicity / Heritage', reward:'Heritage shade matching', multi:true },
  { key:'skinConcerns', label:'Skin Concerns', reward:'Targeted recommendations', multi:true },
  { key:'beautyGoals', label:'Beauty Goals', reward:'Occasion-curated picks', multi:true },
  { key:'budget', label:'Monthly Budget', reward:'Budget-optimised matches' },
  { key:'climate', label:'Climate', reward:'Climate-aware formulas' },
];

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getProfile);
  const [openSection, setOpenSection] = useState(null);

  function save(key, val) {
    const next = { ...profile, [key]: val };
    setProfile(next);
    localStorage.setItem('mmm_profile', JSON.stringify(next));
  }

  function toggleMulti(key, val) {
    const arr = profile[key] || [];
    save(key, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  }

  const completed = SECTIONS.filter(s => {
    const v = profile[s.key];
    return s.multi ? (Array.isArray(v) && v.length > 0) : !!v;
  }).length;
  const skinToneDone = !!profile.skinTone;
  const totalDone = completed + (skinToneDone ? 1 : 0);
  const totalSections = SECTIONS.length + 1;
  const pct = Math.round((totalDone / totalSections) * 100);

  function isComplete(s) {
    const v = profile[s.key];
    return s.multi ? (Array.isArray(v) && v.length > 0) : !!v;
  }

  const pillStyle = (active) => ({
    padding:'10px 14px',borderRadius:20,cursor:'pointer',fontSize:13,fontWeight:600,
    border: active ? '2px solid #7c3aed' : '2px solid #e5e7eb',
    background: active ? '#f5f3ff' : 'white',
    color: active ? '#7c3aed' : '#555',
    transition:'all 0.15s',minHeight:44,
  });

  function renderOptions(section) {
    if (section.key === 'ageRange') return AGE_RANGES.map(v => (
      <button key={v} onClick={()=>save('ageRange',v)} style={pillStyle(profile.ageRange===v)}>{v}</button>
    ));
    if (section.key === 'ethnicity') return ETHNICITIES.map(v => (
      <button key={v} onClick={()=>toggleMulti('ethnicity',v)} style={pillStyle((profile.ethnicity||[]).includes(v))}>{v}</button>
    ));
    if (section.key === 'skinConcerns') return SKIN_CONCERNS.map(v => (
      <button key={v} onClick={()=>toggleMulti('skinConcerns',v)} style={pillStyle((profile.skinConcerns||[]).includes(v))}>{v}</button>
    ));
    if (section.key === 'beautyGoals') return BEAUTY_GOALS.map(v => (
      <button key={v} onClick={()=>toggleMulti('beautyGoals',v)} style={pillStyle((profile.beautyGoals||[]).includes(v))}>{v}</button>
    ));
    if (section.key === 'budget') return BUDGETS.map(v => (
      <button key={v} onClick={()=>save('budget',v)} style={pillStyle(profile.budget===v)}>{v}</button>
    ));
    if (section.key === 'climate') return CLIMATES.map(v => (
      <button key={v} onClick={()=>save('climate',v)} style={pillStyle(profile.climate===v)}>{v}</button>
    ));
  }

  return (
    <div style={{minHeight:'100vh',background:'#1C1C1E',fontFamily:"'Segoe UI',sans-serif"}}>
      {/* Header */}
      <div style={{background:'white',padding:'16px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{maxWidth:560,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={()=>navigate(-1)} style={{background:'none',border:'1px solid #e5e7eb',borderRadius:10,padding:'8px 14px',cursor:'pointer',fontSize:13,color:'#666',fontWeight:600}}>← Back</button>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:20}}>{pct===100?'✨':'🧬'}</span>
            <span style={{fontWeight:800,fontSize:16,background:'#C9A96E',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{pct===100?'Beauty DNA Complete!':'Your Beauty DNA'}</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:560,margin:'0 auto',padding:'20px 16px 60px'}}>
        {/* Progress bar */}
        <div style={{background:'white',borderRadius:20,padding:20,boxShadow:'0 4px 20px rgba(0,0,0,0.08)',marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <span style={{fontSize:13,fontWeight:700,color:'#1a1a1a'}}>{pct===100?'Profile Complete':'Profile Completeness'}</span>
            <span style={{fontSize:14,fontWeight:800,color:pct===100?'#16a34a':'#7c3aed'}}>{pct}%</span>
          </div>
          <div style={{height:10,background:pct===100?'#dcfce7':'#f3e8ff',borderRadius:5,overflow:'hidden'}}>
            <div style={{height:'100%',background:pct===100?'#16a34a':'#C9A96E',borderRadius:5,width:`${pct}%`,transition:'width 0.5s ease'}} />
          </div>
          {pct===100 ? (
            <div style={{fontSize:12,color:'#16a34a',marginTop:8,fontWeight:600}}>Maya now knows your beauty profile. Your recommendations are fully personalised. ✨</div>
          ) : (
            <div style={{fontSize:11,color:'#888',marginTop:8}}>{totalDone} of {totalSections} sections complete — the more you share, the better Maya knows you</div>
          )}
        </div>

        {/* Skin Tone (always first) */}
        <div style={{background:'white',borderRadius:20,padding:16,boxShadow:'0 4px 16px rgba(0,0,0,0.06)',marginBottom:12}}>
          <div onClick={()=>setOpenSection(openSection==='skinTone'?null:'skinTone')} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',minHeight:44}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {skinToneDone ? <span style={{fontSize:18}}>✅</span> : <span style={{fontSize:18}}>⬜</span>}
              <div>
                <div style={{fontWeight:700,fontSize:14,color:'#1a1a1a'}}>Skin Tone</div>
                {skinToneDone && <div style={{fontSize:11,color:'#16a34a',fontWeight:600}}>Unlocked: Better shade matching</div>}
              </div>
            </div>
            <span style={{fontSize:16,color:'#aaa'}}>{openSection==='skinTone'?'▲':'▼'}</span>
          </div>
          {openSection==='skinTone' && (
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:14}}>
              {SKIN_TONES.map(st => (
                <button key={st.id} onClick={()=>save('skinTone',st.id)} style={pillStyle(profile.skinTone===st.id)}>{st.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Other sections */}
        {SECTIONS.map(section => {
          const done = isComplete(section);
          const open = openSection === section.key;
          return (
            <div key={section.key} style={{background:'white',borderRadius:20,padding:16,boxShadow:'0 4px 16px rgba(0,0,0,0.06)',marginBottom:12}}>
              <div onClick={()=>setOpenSection(open?null:section.key)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',minHeight:44}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  {done ? <span style={{fontSize:18}}>✅</span> : <span style={{fontSize:18}}>⬜</span>}
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:'#1a1a1a'}}>{section.label}</div>
                    {done && <div style={{fontSize:11,color:'#16a34a',fontWeight:600}}>Unlocked: {section.reward}</div>}
                  </div>
                </div>
                <span style={{fontSize:16,color:'#aaa'}}>{open?'▲':'▼'}</span>
              </div>
              {open && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:14}}>
                  {renderOptions(section)}
                </div>
              )}
            </div>
          );
        })}

        {/* Data-for-value bonus */}
        <div style={{background:'linear-gradient(135deg,#fdf2f8,#f3e8ff)',border:'1px solid #f0abda',borderRadius:20,padding:20,marginTop:20}}>
          <div style={{fontSize:15,fontWeight:800,color:'#1a1a1a',marginBottom:8}}>🎁 Bonus Rewards</div>
          <div style={{fontSize:12,color:'#7c6a8a',lineHeight:1.6,marginBottom:16}}>Complete your profile to help Maya give you the best advice. Premium features unlock as you share more!</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{background:'white',borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>💰</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:'#333'}}>Tell Maya your monthly beauty spend</div>
                <div style={{fontSize:11,color:'#888'}}>Get 1 extra month free Premium</div>
              </div>
              {profile.monthlySpend ? <span style={{fontSize:14}}>✅</span> : (
                <select value={profile.monthlySpend||''} onChange={e=>save('monthlySpend',e.target.value)} style={{padding:'6px 8px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:11,color:'#555'}}>
                  <option value="">Select</option>
                  <option value="0-25">$0-25/mo</option>
                  <option value="25-50">$25-50/mo</option>
                  <option value="50-100">$50-100/mo</option>
                  <option value="100-200">$100-200/mo</option>
                  <option value="200+">$200+/mo</option>
                </select>
              )}
            </div>
            <div style={{background:'white',borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>📋</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:'#333'}}>Join Maya's Beauty Panel</div>
                <div style={{fontSize:11,color:'#888'}}>Answer 3 questions monthly for Premium credits</div>
              </div>
              <button onClick={()=>save('beautyPanel',!profile.beautyPanel)} style={{padding:'6px 12px',borderRadius:10,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,background:profile.beautyPanel?'#C9A96E':'#f3e8ff',color:profile.beautyPanel?'white':'#7c3aed'}}>
                {profile.beautyPanel?'Joined ✓':'Join'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
