// v2.1 hub. Lifts the existing Beauty DNA profile-builder logic from
// Profile.jsx verbatim and adds three placeholder action zones at the
// top. Action handlers are no-ops in Step 2 — Step 3 wires them.
//
// Sign-in zone is hidden once the user is authed (Q1=(b)).
// No back-nav: this IS the hub, not a sub-page (Q2=(a)).
//
// Existing English-only strings (section labels, rewards, preferences,
// bonus rewards copy) carry over from Profile.jsx as Phase 4+ i18n
// tech debt. NEW v2.1 strings (the three action-zone labels) ship in
// 15 locales per Path A — AI-generated, native QA pass scheduled for
// Phase 4+ pre-launch on US/IN/BR/CN/ID/NG per the i18n strategy memory.

import { useState } from "react";
import { useUser } from "../lib/auth";

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

const SECTIONS = [
  { key:'ageRange', label:'Age Range', reward:'Age-matched advice' },
  { key:'ethnicity', label:'Ethnicity / Heritage', reward:'Heritage shade matching', multi:true },
  { key:'skinConcerns', label:'Skin Concerns', reward:'Targeted recommendations', multi:true },
  { key:'beautyGoals', label:'Beauty Goals', reward:'Occasion-curated picks', multi:true },
  { key:'budget', label:'Monthly Budget', reward:'Budget-optimised matches' },
  { key:'climate', label:'Climate', reward:'Climate-aware formulas' },
];

// v2.1 action-zone strings — 15 locales (Path A).
// FLAGS for native QA: 'ar' 'خذ الاختبار' may read formal — verify
// register matches beauty-app tone (cf. Header.jsx T_MYDNA where the
// DNA-loanword form was chosen over scientific register for the same
// reason); 'af' uses English-borrowed terms (technical Afrikaans is
// "vasvra"/"DNS") — verify "Doen Vasvra" reads natural.
const T_ACTIONS = {
  en:      { takeQuiz: 'Take Quiz',         justScan: 'Just Scan',      signIn: 'Sign in' },
  'en-za': { takeQuiz: 'Take Quiz',         justScan: 'Just Scan',      signIn: 'Sign in' },
  es:      { takeQuiz: 'Hacer Quiz',        justScan: 'Solo Escanear',  signIn: 'Iniciar Sesión' },
  pt:      { takeQuiz: 'Fazer Quiz',        justScan: 'Só Escanear',    signIn: 'Entrar' },
  fr:      { takeQuiz: 'Faire le Quiz',     justScan: 'Juste Scanner',  signIn: 'Se Connecter' },
  zh:      { takeQuiz: '做测试',             justScan: '直接扫描',         signIn: '登录' },
  ar:      { takeQuiz: 'خذ الاختبار',         justScan: 'امسح فقط',         signIn: 'تسجيل الدخول' },
  hi:      { takeQuiz: 'क्विज़ लें',          justScan: 'बस स्कैन करें',     signIn: 'साइन इन' },
  bn:      { takeQuiz: 'কুইজ নিন',           justScan: 'শুধু স্ক্যান করুন',  signIn: 'সাইন ইন' },
  id:      { takeQuiz: 'Mulai Quiz',        justScan: 'Pindai Saja',    signIn: 'Masuk' },
  sw:      { takeQuiz: 'Fanya Jaribio',     justScan: 'Skani Tu',       signIn: 'Ingia' },
  tl:      { takeQuiz: 'Sagutin ang Quiz',  justScan: 'Mag-scan Lang',  signIn: 'Mag-Sign In' },
  af:      { takeQuiz: 'Doen Vasvra',       justScan: 'Net Skandeer',   signIn: 'Teken In' },
  zu:      { takeQuiz: 'Yenza I-Quiz',      justScan: 'Skena Nje',      signIn: 'Ngena' },
  ng:      { takeQuiz: 'Take Quiz',         justScan: 'Just Scan',      signIn: 'Sign in' },
};

function getProfile() {
  try { return JSON.parse(localStorage.getItem('mmm_profile') || '{}'); } catch { return {}; }
}

function resolveLang() {
  try {
    return sessionStorage.getItem('mmm_language') || sessionStorage.getItem('mmm_lang') || 'en';
  } catch {
    return 'en';
  }
}

const actionBtnStyle = {
  padding:'10px 14px',borderRadius:20,cursor:'pointer',fontSize:13,fontWeight:600,
  border:'2px solid #555',background:'#2C2C2E',color:'#F5F0E8',
  minHeight:44,fontFamily:"'Segoe UI',sans-serif",
};

export default function MyDNA() {
  const { session, loading } = useUser();
  const t = T_ACTIONS[resolveLang()] || T_ACTIONS.en;
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
    border: active ? '2px solid #C9A96E' : '2px solid #555',
    background: active ? '#3C3C3E' : '#2C2C2E',
    color: active ? '#C9A96E' : '#F5F0E8',
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
      <div style={{maxWidth:560,margin:'0 auto',padding:'20px 16px 60px'}}>
        <h1 style={{margin:'0 0 16px',fontSize:22,fontWeight:800,color:'#F5F0E8'}}>
          {pct === 100 ? '✨ Beauty DNA Complete!' : '🧬 Your Beauty DNA'}
        </h1>

        {/* v2.1 placeholder action zones — Step 3 wires real handlers */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
          <button onClick={()=>{}} style={actionBtnStyle}>{t.takeQuiz}</button>
          <button onClick={()=>{}} style={actionBtnStyle}>{t.justScan}</button>
          {!loading && !session && (
            <button onClick={()=>{}} style={actionBtnStyle}>{t.signIn}</button>
          )}
        </div>

        {/* Progress bar */}
        <div style={{background:'#2C2C2E',borderRadius:20,padding:20,boxShadow:'0 4px 20px rgba(0,0,0,0.08)',marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <span style={{fontSize:13,fontWeight:700,color:'#F5F0E8'}}>{pct===100?'Profile Complete':'Profile Completeness'}</span>
            <span style={{fontSize:14,fontWeight:800,color:pct===100?'#16a34a':'#7c3aed'}}>{pct}%</span>
          </div>
          <div style={{height:10,background:pct===100?'#1a3a1a':'#3C3C3E',borderRadius:5,overflow:'hidden'}}>
            <div style={{height:'100%',background:pct===100?'#16a34a':'#C9A96E',borderRadius:5,width:`${pct}%`,transition:'width 0.5s ease'}} />
          </div>
          {pct===100 ? (
            <div style={{fontSize:12,color:'#16a34a',marginTop:8,fontWeight:600}}>Maya now knows your beauty profile. Your recommendations are fully personalised. ✨</div>
          ) : (
            <div style={{fontSize:11,color:'#888',marginTop:8}}>{totalDone} of {totalSections} sections complete — the more you share, the better Maya knows you</div>
          )}
        </div>

        {/* Skin Tone (always first) */}
        <div style={{background:'#2C2C2E',borderRadius:20,padding:16,boxShadow:'0 4px 16px rgba(0,0,0,0.06)',marginBottom:12}}>
          <div onClick={()=>setOpenSection(openSection==='skinTone'?null:'skinTone')} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',minHeight:44}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {skinToneDone ? <span style={{fontSize:18}}>✅</span> : <span style={{fontSize:18}}>⬜</span>}
              <div>
                <div style={{fontWeight:700,fontSize:14,color:'#F5F0E8'}}>Skin Tone</div>
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
            <div key={section.key} style={{background:'#2C2C2E',borderRadius:20,padding:16,boxShadow:'0 4px 16px rgba(0,0,0,0.06)',marginBottom:12}}>
              <div onClick={()=>setOpenSection(open?null:section.key)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',minHeight:44}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  {done ? <span style={{fontSize:18}}>✅</span> : <span style={{fontSize:18}}>⬜</span>}
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:'#F5F0E8'}}>{section.label}</div>
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

        {/* My Preferences */}
        <div style={{background:'#2C2C2E',borderRadius:20,padding:16,boxShadow:'0 4px 16px rgba(0,0,0,0.06)',marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:14,color:'#F5F0E8',marginBottom:12}}>My Preferences</div>
          <div style={{fontSize:12,color:'#888',marginBottom:10}}>Preferred sharing platform</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {[['whatsapp','💬 WhatsApp'],['instagram','📸 Instagram'],['wechat','🟢 WeChat'],['telegram','✈️ Telegram'],['facebook','💭 Messenger'],['copy','🔗 Copy Link']].map(([id,label])=>(
              <button key={id} onClick={()=>save('sharePreference',id)} style={pillStyle(profile.sharePreference===id)}>{label}</button>
            ))}
          </div>
        </div>

        {/* Data-for-value bonus */}
        <div style={{background:'#2C2C2E',border:'1px solid #C9A96E',borderRadius:20,padding:20,marginTop:20}}>
          <div style={{fontSize:15,fontWeight:800,color:'#F5F0E8',marginBottom:8}}>🎁 Bonus Rewards</div>
          <div style={{fontSize:12,color:'rgba(201,169,110,0.7)',lineHeight:1.6,marginBottom:16}}>Complete your profile to help Maya give you the best advice. Premium features unlock as you share more!</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{background:'#3C3C3E',borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>💰</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:'#F5F0E8'}}>Tell Maya your monthly beauty spend</div>
                <div style={{fontSize:11,color:'rgba(201,169,110,0.7)'}}>Get 1 extra month free Premium</div>
              </div>
              {profile.monthlySpend ? <span style={{fontSize:14}}>✅</span> : (
                <select value={profile.monthlySpend||''} onChange={e=>save('monthlySpend',e.target.value)} style={{padding:'6px 8px',borderRadius:10,border:'1px solid #555',fontSize:11,color:'#F5F0E8',background:'#2C2C2E'}}>
                  <option value="">Select</option>
                  <option value="0-25">$0-25/mo</option>
                  <option value="25-50">$25-50/mo</option>
                  <option value="50-100">$50-100/mo</option>
                  <option value="100-200">$100-200/mo</option>
                  <option value="200+">$200+/mo</option>
                </select>
              )}
            </div>
            <div style={{background:'#3C3C3E',borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>📋</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:'#F5F0E8'}}>Join Maya's Beauty Panel</div>
                <div style={{fontSize:11,color:'rgba(201,169,110,0.7)'}}>Answer 3 questions monthly for Premium credits</div>
              </div>
              <button onClick={()=>save('beautyPanel',!profile.beautyPanel)} style={{padding:'6px 12px',borderRadius:10,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,background:profile.beautyPanel?'#C9A96E':'#2C2C2E',color:profile.beautyPanel?'#1C1C1E':'#C9A96E'}}>
                {profile.beautyPanel?'Joined ✓':'Join'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
