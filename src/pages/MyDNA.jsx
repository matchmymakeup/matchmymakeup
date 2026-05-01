// v2.1 hub — visual rebuild for Desiree-review demo (speed mode).
// Cream/white/ink/clay palette, serif headline, hero with shade avatar,
// 3 quick-action tiles, 8 library category tiles.
//
// Existing v1 Beauty DNA profile builder is preserved inline inside a
// collapsed <details> accordion at the bottom (dark theme visible when
// expanded — acceptable mismatch per the speed-mode brief; full polish
// in post-Desiree-review pass).
//
// English-only strings throughout — Path A i18n deferred to Phase 4+.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { formatShadeName } from "../lib/munsell";

// 8 library categories per v2.1 decision #10
const CATEGORIES = [
  { key: 'lipstick',    label: 'Lipstick',    emoji: '💄' },
  { key: 'nail_polish', label: 'Nail Polish', emoji: '💅' },
  { key: 'foundation',  label: 'Foundation',  emoji: '🧴' },
  { key: 'mascara',     label: 'Mascara',     emoji: '👁️' },
  { key: 'blush',       label: 'Blush',       emoji: '🌸' },
  { key: 'eyeshadow',   label: 'Eyeshadow',   emoji: '✨' },
  { key: 'highlighter', label: 'Highlighter', emoji: '🌟' },
  { key: 'lip_liner',   label: 'Lip Liner',   emoji: '💋' },
];

function getProfileLS() {
  try { return JSON.parse(localStorage.getItem('mmm_profile') || '{}'); } catch { return {}; }
}
function getSavedShadesLS() {
  try { return JSON.parse(localStorage.getItem('mmm_my_shades') || '[]'); } catch { return []; }
}
function getSavedProductsLS() {
  try { return JSON.parse(localStorage.getItem('mmm_my_products') || '[]'); } catch { return []; }
}

function categoryCount(arr, key) {
  return arr.filter(item =>
    (item.category || '').toLowerCase().replace(/\s+/g, '_') === key
  ).length;
}

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "'Segoe UI', system-ui, -apple-system, sans-serif";
const CREAM = '#F5F1EA';
const WHITE = '#FFFFFF';
const INK   = '#1A1A1A';
const CLAY  = '#9C5B4A';
const HAIRLINE = 'rgba(26,26,26,0.08)';
const DIM   = 'rgba(26,26,26,0.55)';
const FAINT = 'rgba(26,26,26,0.35)';

const tileBase = {
  background: WHITE,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 14,
  padding: '16px 12px',
  cursor: 'pointer',
  fontFamily: SANS,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
  minHeight: 86,
  transition: 'transform 120ms ease, border-color 120ms ease',
};
const tilePrimary = { ...tileBase, border: `2px solid ${CLAY}` };

const catTileStyle = {
  background: WHITE,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 14,
  padding: '14px 16px',
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: SANS,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  minHeight: 64,
};

export default function MyDNA() {
  const { session, loading } = useUser();
  const navigate = useNavigate();

  const profile = getProfileLS();
  const shades = getSavedShadesLS();
  const products = getSavedProductsLS();
  const primaryShade = shades[shades.length - 1] || null;

  const userName =
    session?.user?.user_metadata?.name ||
    (session?.user?.email && session.user.email.split('@')[0]) ||
    profile?.name ||
    null;

  // country_code (ISO) preferred; falls back to legacy profiles.country (full
  // name) and finally to 'AU' for the demo. Migration 0004 added country_code
  // but write-paths from My DNA creation aren't wired yet (Step 3).
  const country = profile.country_code || profile.country || 'AU';
  const shadeDisplay = primaryShade?.hex
    ? formatShadeName(primaryShade.hex, country)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px 60px' }}>

        {/* Hero — shade circle + greeting + shade name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: primaryShade?.hex || '#E5E0D5',
            border: `3px solid ${WHITE}`,
            boxShadow: '0 2px 12px rgba(26,26,26,0.08)',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontSize: 30, fontWeight: 600, color: INK,
              fontFamily: SERIF, letterSpacing: '-0.02em', lineHeight: 1.1,
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {userName ? `Hi ${userName}` : 'Hi there'}
            </h1>
            {shadeDisplay ? (
              <div style={{ fontSize: 13, color: CLAY, marginTop: 6, fontFamily: SANS, fontWeight: 500 }}>
                {shadeDisplay}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: DIM, marginTop: 6, fontFamily: SANS }}>
                Take the quiz to find your shade
              </div>
            )}
          </div>
        </div>

        {/* Quick action tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 8,
          marginBottom: 36,
        }}>
          <button onClick={() => {/* Step 4 wires */}} style={tilePrimary}>
            <div style={{ fontSize: 24, lineHeight: 1 }}>✨</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: INK, marginTop: 4 }}>Take Quiz</div>
          </button>
          <button onClick={() => navigate('/ColorScanner')} style={tileBase}>
            <div style={{ fontSize: 24, lineHeight: 1 }}>📷</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: INK, marginTop: 4 }}>Just Scan</div>
          </button>
          {!loading && !session && (
            <button onClick={() => navigate('/LogIn')} style={tileBase}>
              <div style={{ fontSize: 24, lineHeight: 1 }}>🔑</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: INK, marginTop: 4 }}>Sign in</div>
            </button>
          )}
        </div>

        {/* Library section heading */}
        <h2 style={{
          margin: '0 0 12px',
          fontSize: 11, fontWeight: 600, color: DIM,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: SANS,
        }}>
          Your Library
        </h2>

        {/* 8 category tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 36,
        }}>
          {CATEGORIES.map(cat => {
            const count = categoryCount(products, cat.key);
            return (
              <button
                key={cat.key}
                onClick={() => navigate('/Library')}
                style={catTileStyle}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{cat.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{cat.label}</div>
                  <div style={{ fontSize: 11, color: count > 0 ? CLAY : FAINT, marginTop: 2 }}>
                    {count > 0 ? `${count} saved` : 'Empty'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Profile builder — collapsed; v1 dark theme inside is intentional
            speed-mode mismatch, polished in post-review pass */}
        <details style={{
          background: WHITE,
          borderRadius: 14,
          padding: '14px 18px',
          border: `1px solid ${HAIRLINE}`,
          marginBottom: 20,
          fontFamily: SANS,
        }}>
          <summary style={{
            cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: INK,
            listStyle: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>Edit your Beauty DNA profile</span>
            <span style={{ fontSize: 14, color: CLAY }}>▾</span>
          </summary>
          <div style={{ marginTop: 14 }}>
            <BeautyDNABuilder />
          </div>
        </details>

        {/* Sign-out — visible only for authed users, secondary placement */}
        {!loading && session && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                background: 'none', border: 'none',
                color: CLAY, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: SANS,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Beauty DNA builder — preserved from v1 Profile.jsx logic, inlined as
// a sub-component so MyDNA can collapse it. Dark theme inside is
// pre-v2.1 styling; post-Desiree-review pass restyles to cream/clay.
// ─────────────────────────────────────────────────────────────────────

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

function BeautyDNABuilder() {
  const [profile, setProfile] = useState(getProfileLS);
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

  const skinToneDone = !!profile.skinTone;
  const completed = SECTIONS.filter(s => {
    const v = profile[s.key];
    return s.multi ? (Array.isArray(v) && v.length > 0) : !!v;
  }).length;
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
    <div style={{background:'#1C1C1E',borderRadius:12,padding:'16px 12px',marginTop:6,fontFamily:"'Segoe UI',sans-serif"}}>
      {/* Progress bar */}
      <div style={{background:'#2C2C2E',borderRadius:14,padding:14,marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontSize:12,fontWeight:700,color:'#F5F0E8'}}>{pct===100?'Profile Complete':'Profile Completeness'}</span>
          <span style={{fontSize:13,fontWeight:800,color:pct===100?'#16a34a':'#7c3aed'}}>{pct}%</span>
        </div>
        <div style={{height:8,background:pct===100?'#1a3a1a':'#3C3C3E',borderRadius:5,overflow:'hidden'}}>
          <div style={{height:'100%',background:pct===100?'#16a34a':'#C9A96E',borderRadius:5,width:`${pct}%`,transition:'width 0.5s ease'}} />
        </div>
      </div>

      {/* Skin Tone */}
      <div style={{background:'#2C2C2E',borderRadius:14,padding:12,marginBottom:8}}>
        <div onClick={()=>setOpenSection(openSection==='skinTone'?null:'skinTone')} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',minHeight:32}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {skinToneDone ? <span style={{fontSize:14}}>✅</span> : <span style={{fontSize:14}}>⬜</span>}
            <div style={{fontWeight:700,fontSize:13,color:'#F5F0E8'}}>Skin Tone</div>
          </div>
          <span style={{fontSize:12,color:'#aaa'}}>{openSection==='skinTone'?'▲':'▼'}</span>
        </div>
        {openSection==='skinTone' && (
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
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
          <div key={section.key} style={{background:'#2C2C2E',borderRadius:14,padding:12,marginBottom:8}}>
            <div onClick={()=>setOpenSection(open?null:section.key)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',minHeight:32}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {done ? <span style={{fontSize:14}}>✅</span> : <span style={{fontSize:14}}>⬜</span>}
                <div style={{fontWeight:700,fontSize:13,color:'#F5F0E8'}}>{section.label}</div>
              </div>
              <span style={{fontSize:12,color:'#aaa'}}>{open?'▲':'▼'}</span>
            </div>
            {open && (
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
                {renderOptions(section)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
