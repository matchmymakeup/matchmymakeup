// v2.1 hub — visual rebuild for Desiree-review demo (speed mode).
// Monochrome chrome (Artefact 2 §7.2), serif headline, hero with shade avatar,
// 3 quick-action tiles, 8 library category tiles, MyDNAArtefactCard at top
// (PR-F-light: Artefact 2 §4.2 portable artefact surface).
//
// English-only strings throughout — Path A i18n deferred to Phase 4+.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { formatShadeName, classifyShade, seasonDisplayEN } from "../lib/munsell";
import { BG_WHITE, BG_OFFWHITE, INK_PRIMARY, INK_SECONDARY, ACCENT_BLACK, HAIRLINE, BORDER_ACTIVE, SHADOW, PLACEHOLDER_BORDER } from "../lib/design-tokens";
import { rgbToLab, seasonToMetallic } from "../lib/colorScience";
import PillButton from "../components/PillButton";

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
function getLibraryLS() {
  try { return JSON.parse(localStorage.getItem('mmm_library') || '{}'); } catch { return {}; }
}

function categoryCount(arr, key) {
  return arr.filter(item =>
    (item.category || '').toLowerCase().replace(/\s+/g, '_') === key
  ).length;
}

const SERIF = "'DM Serif Display', Georgia, serif";
const SANS  = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

const tileBase = {
  background: BG_WHITE,
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
const tilePrimary = { ...tileBase, background: ACCENT_BLACK, border: `2px solid ${BORDER_ACTIVE}` };

const catTileStyle = {
  background: BG_WHITE,
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

// scannedRed/Green/Blue isn't persisted by saveScan; derive RGB from color_hex instead.
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.replace(/^#/, '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

// ─────────────────────────────────────────────────────────────────────
// MyDNAArtefactCard — user-facing portable colour artefact per Artefact
// 2 §4.2. SEASON / CIELAB / PALETTE (placeholder) / METALLIC fields
// ladder to the panel record (Charter §1.1). LocalStorage source-of-
// truth this PR; DB-backed read path downstream of Phase 1 auth.
// Save/Share onClick stubs are post-Desiree gated.
// ─────────────────────────────────────────────────────────────────────

function MyDNAArtefactCard() {
  const profile = getProfileLS();
  const country = profile.country_code || profile.country || 'AU';

  const lib = getLibraryLS();
  const scans = Array.isArray(lib.scans) ? lib.scans : [];
  const latestScan = scans.length > 0 ? scans[scans.length - 1] : null;

  const scanRgb = latestScan ? hexToRgb(latestScan.color_hex) : null;
  const lab = scanRgb ? rgbToLab(scanRgb) : null;

  // profile.season is dead-write; derive at render via munsell classifier.
  // Pass canonical key to seasonToMetallic (Fall vs Autumn collapses to one).
  const classification = scanRgb ? classifyShade(latestScan.color_hex, country) : null;
  const season = classification
    ? seasonDisplayEN(classification.canonicalSeasonKey, classification.hemisphere)
    : null;
  const metallic = seasonToMetallic(classification?.canonicalSeasonKey);

  const scanDate = (latestScan && latestScan.timestamp)
    ? new Date(latestScan.timestamp).toLocaleDateString('en-AU', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';

  const labelStyle = {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: 600,
    color: INK_SECONDARY,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: 8,
  };

  return (
    <div style={{
      background: BG_WHITE,
      borderRadius: 14,
      padding: '24px 20px',
      margin: '0 auto 24px',
      boxShadow: SHADOW,
      border: `1px solid ${HAIRLINE}`,
      fontFamily: SANS,
    }}>
      {/* Header row — wordmark + scan date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 400, color: INK_PRIMARY, letterSpacing: '-0.01em' }}>
          MatchMyMakeup
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: INK_SECONDARY }}>
          {scanDate}
        </div>
      </div>

      {/* SEASON */}
      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>Season</div>
        <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: INK_PRIMARY, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {season || 'Not yet classified'}
        </div>
      </div>

      {/* CIELAB */}
      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>CIELAB</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {['L', 'a', 'b'].map(k => (
            <div key={k} style={{ fontFamily: SANS, fontSize: 18, fontWeight: 600, color: INK_PRIMARY, fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ color: INK_SECONDARY, fontWeight: 500, marginRight: 4 }}>{k}</span>
              {lab ? lab[k].toFixed(1) : '—'}
            </div>
          ))}
        </div>
      </div>

      {/* PALETTE */}
      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>Palette</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              background: 'transparent',
              border: `1.5px dashed ${PLACEHOLDER_BORDER}`,
            }} />
          ))}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 11, color: INK_SECONDARY }}>
          Palette mapping in development.
        </div>
      </div>

      {/* METALLIC — omit section entirely when null (boundary case deferred) */}
      {metallic && (
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Metallic</div>
          <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: INK_PRIMARY }}>
            {metallic}
          </div>
        </div>
      )}

      {/* Save / Share — stub onClicks; real export gated on Desiree review */}
      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <PillButton size="sm" onClick={() => console.log('save: post-Desiree')}>Save</PillButton>
        <PillButton size="sm" onClick={() => console.log('share: post-Desiree')}>Share</PillButton>
      </div>
    </div>
  );
}

export default function MyDNA() {
  const { session, loading } = useUser();
  const navigate = useNavigate();

  // 100px aligns tile icon with "Just Scan" text in 2-col anon grid; auth collapses to 1-col, parity breaks.
  const isAnon = !loading && !session;
  const tileLeftPadding = isAnon ? 100 : 16;

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
    <div style={{ minHeight: '100vh', background: BG_WHITE }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px 60px' }}>

        <MyDNAArtefactCard />

        {/* Hero — shade circle + greeting + shade name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: primaryShade?.hex || '#E5E0D5',
            border: `3px solid ${BG_WHITE}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontSize: 24, fontWeight: 400, color: INK_PRIMARY,
              fontFamily: SERIF, letterSpacing: '-0.02em', lineHeight: 1.15,
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {userName ? `Hi ${userName}` : 'Hi there'}
            </h1>
            {shadeDisplay ? (
              <div style={{ fontSize: 13, color: INK_PRIMARY, marginTop: 6, fontFamily: SANS, fontWeight: 500 }}>
                {shadeDisplay}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: INK_SECONDARY, marginTop: 6, fontFamily: SANS }}>
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
          {/* Take Quiz tile hidden until PR7 wires /Quiz. Re-add with
              tilePrimary (and demote Just Scan back to tileBase) when
              the route exists. */}
          <button onClick={() => navigate('/ColorScanner')} style={tilePrimary}>
            <div style={{ fontSize: 24, lineHeight: 1 }}>📷</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: BG_WHITE, marginTop: 4 }}>Just Scan</div>
          </button>
          {!loading && !session && (
            <button onClick={() => navigate('/LogIn')} style={tileBase}>
              <div style={{ fontSize: 24, lineHeight: 1 }}>🔑</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: INK_PRIMARY, marginTop: 4 }}>Sign in</div>
            </button>
          )}
        </div>

        {/* Library section heading */}
        <h2 style={{
          margin: '0 0 12px',
          fontSize: 11, fontWeight: 600, color: INK_SECONDARY,
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
                style={{...catTileStyle, paddingLeft: tileLeftPadding}}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{cat.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK_PRIMARY }}>{cat.label}</div>
                  <div style={{ fontSize: 11, color: count > 0 ? INK_PRIMARY : INK_SECONDARY, marginTop: 2 }}>
                    {count > 0 ? `${count} saved` : 'Empty'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Profile builder — collapsed */}
        <details style={{
          background: BG_WHITE,
          borderRadius: 14,
          padding: '14px 0',
          border: `1px solid ${HAIRLINE}`,
          marginBottom: 20,
          fontFamily: SANS,
        }}>
          <summary style={{
            cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: INK_PRIMARY,
            listStyle: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>Edit your Beauty DNA profile</span>
            <span style={{ fontSize: 14, color: INK_SECONDARY }}>▾</span>
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
                color: INK_SECONDARY, fontSize: 12, fontWeight: 600,
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
// a sub-component so MyDNA can collapse it. Monochrome chrome per
// Artefact 2 §7.1–§7.3 (PR-F-light retrofit, 2026-05-08).
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

  function renderOptions(section) {
    if (section.key === 'ageRange') return AGE_RANGES.map(v => (
      <PillButton key={v} active={profile.ageRange===v} onClick={()=>save('ageRange',v)}>{v}</PillButton>
    ));
    if (section.key === 'ethnicity') return ETHNICITIES.map(v => (
      <PillButton key={v} active={(profile.ethnicity||[]).includes(v)} onClick={()=>toggleMulti('ethnicity',v)}>{v}</PillButton>
    ));
    if (section.key === 'skinConcerns') return SKIN_CONCERNS.map(v => (
      <PillButton key={v} active={(profile.skinConcerns||[]).includes(v)} onClick={()=>toggleMulti('skinConcerns',v)}>{v}</PillButton>
    ));
    if (section.key === 'beautyGoals') return BEAUTY_GOALS.map(v => (
      <PillButton key={v} active={(profile.beautyGoals||[]).includes(v)} onClick={()=>toggleMulti('beautyGoals',v)}>{v}</PillButton>
    ));
    if (section.key === 'budget') return BUDGETS.map(v => (
      <PillButton key={v} active={profile.budget===v} onClick={()=>save('budget',v)}>{v}</PillButton>
    ));
    if (section.key === 'climate') return CLIMATES.map(v => (
      <PillButton key={v} active={profile.climate===v} onClick={()=>save('climate',v)}>{v}</PillButton>
    ));
  }

  return (
    <div style={{background:BG_WHITE,borderRadius:12,padding:'16px 12px',marginTop:6,fontFamily:SANS}}>
      {/* Progress bar */}
      <div style={{background:BG_OFFWHITE,borderRadius:14,padding:14,marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontSize:12,fontWeight:700,color:INK_PRIMARY}}>{pct===100?'Profile Complete':'Profile Completeness'}</span>
          <span style={{fontSize:13,fontWeight:800,color:INK_PRIMARY}}>{pct}%</span>
        </div>
        <div style={{height:8,background:HAIRLINE,borderRadius:5,overflow:'hidden'}}>
          <div style={{height:'100%',background:INK_PRIMARY,borderRadius:5,width:`${pct}%`,transition:'width 0.5s ease'}} />
        </div>
      </div>

      {/* Skin Tone */}
      <div style={{background:BG_OFFWHITE,borderRadius:14,padding:12,marginBottom:8}}>
        <div onClick={()=>setOpenSection(openSection==='skinTone'?null:'skinTone')} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',minHeight:32}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {skinToneDone ? <span style={{fontSize:14}}>✅</span> : <span style={{fontSize:14}}>⬜</span>}
            <div style={{fontWeight:700,fontSize:13,color:INK_PRIMARY}}>Skin Tone</div>
          </div>
          <span style={{fontSize:12,color:INK_SECONDARY}}>{openSection==='skinTone'?'▲':'▼'}</span>
        </div>
        {openSection==='skinTone' && (
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
            {SKIN_TONES.map(st => (
              <PillButton key={st.id} active={profile.skinTone===st.id} onClick={()=>save('skinTone',st.id)}>{st.label}</PillButton>
            ))}
          </div>
        )}
      </div>

      {/* Other sections */}
      {SECTIONS.map(section => {
        const done = isComplete(section);
        const open = openSection === section.key;
        return (
          <div key={section.key} style={{background:BG_OFFWHITE,borderRadius:14,padding:12,marginBottom:8}}>
            <div onClick={()=>setOpenSection(open?null:section.key)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',minHeight:32}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {done ? <span style={{fontSize:14}}>✅</span> : <span style={{fontSize:14}}>⬜</span>}
                <div style={{fontWeight:700,fontSize:13,color:INK_PRIMARY}}>{section.label}</div>
              </div>
              <span style={{fontSize:12,color:INK_SECONDARY}}>{open?'▲':'▼'}</span>
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
