// v2.1 Page-1 entry — PR4 rebuild using shared button vocabulary.
// Cream/clay/serif aesthetic; CircleIconButton entry tiles; Dropdown
// consultant selector wired to sessionStorage 'mmm_language' (same key
// ColorScanner.jsx:352 reads from). English-only chrome per speed-mode.
//
// Wiring:
//   Take Quiz  → no-op (PR6 builds /Quiz). Demoted to secondary tile
//                (active=false default) until then — a no-op highlighted
//                CTA reads as broken in stakeholder review. Reverts to
//                active=true at PR6.
//   Just Scan  → /ColorScanner (no auth gate, anon flow). active=true
//                marks the highlighted recommended path until quiz lands.
//   Sign in    → /LogIn (anon-only; authed users see "Continue to My
//                DNA →" link instead).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/auth";
import CircleIconButton from "../components/CircleIconButton";
import Dropdown from "../components/Dropdown";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "'Segoe UI', system-ui, -apple-system, sans-serif";
const CREAM = '#F5F1EA';
const INK   = '#1A1A1A';
const CLAY  = '#9C5B4A';
const DIM   = 'rgba(26,26,26,0.55)';

// 15 personas, slash-separated <Language> / <Persona> / <Region> labels
// (locked 2026-05-02). Inlined here vs centralising to src/lib/personas.js
// — deliberate duplication for speed-mode scope. Two pre-existing persona
// definitions live elsewhere (ColorScanner.jsx:420 UI, api/advice.js:71
// server-side culture/lang). DRY violation banked, polish-pass refactor.
const PERSONA_OPTIONS = [
  { value: 'en',    icon: '💄', label: 'English / Maya / Global' },
  { value: 'hi',    icon: '🪷', label: 'Hindi / Priya / India' },
  { value: 'pt',    icon: '💃', label: 'Portuguese / Valentina / Brazil' },
  { value: 'zh',    icon: '🌸', label: 'Mandarin / Mei / China' },
  { value: 'id',    icon: '🌺', label: 'Bahasa / Sari / Indonesia' },
  { value: 'ng',    icon: '👑', label: 'Pidgin / Adaeze / Nigeria' },
  { value: 'es',    icon: '💃', label: 'Spanish / Isabella / Latin America' },
  { value: 'ar',    icon: '✨', label: 'Arabic / Layla / MENA' },
  { value: 'fr',    icon: '🗼', label: 'French / Céline / France' },
  { value: 'bn',    icon: '🌹', label: 'Bengali / Ananya / Bangladesh' },
  { value: 'sw',    icon: '🌍', label: 'Swahili / Amara / East Africa' },
  { value: 'tl',    icon: '🌺', label: 'Tagalog / Gabriela / Philippines' },
  { value: 'af',    icon: '🌸', label: 'Afrikaans / Liezel / South Africa' },
  { value: 'zu',    icon: '👑', label: 'Zulu / Nomvula / South Africa' },
];

function getInitialLang() {
  try {
    return sessionStorage.getItem('mmm_language')
        || sessionStorage.getItem('mmm_lang')
        || 'en';
  } catch {
    return 'en';
  }
}

export default function Landing() {
  const { session, loading } = useUser();
  const navigate = useNavigate();
  const [lang, setLang] = useState(getInitialLang);

  function handleLangChange(value) {
    setLang(value);
    try { sessionStorage.setItem('mmm_language', value); } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 60px' }}>

        {/* Wordmark */}
        <div style={{
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: CLAY,
          letterSpacing: '0.3em',
          fontFamily: SERIF,
          marginBottom: 64,
        }}>
          MATCHMYMAKEUP
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            margin: 0,
            fontSize: 44,
            fontWeight: 600,
            color: INK,
            fontFamily: SERIF,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 14,
          }}>
            Find your shade
          </h1>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: DIM,
            fontFamily: SANS,
            lineHeight: 1.5,
            maxWidth: 320,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            AI shade matching across global brands. In your language.
          </p>
        </div>

        {/* Consultant dropdown — sets sessionStorage.mmm_language for the journey */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <Dropdown
            value={lang}
            options={PERSONA_OPTIONS}
            onChange={handleLangChange}
            placeholder="Choose your consultant"
          />
        </div>

        {/* Entry tiles */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 28,
          marginBottom: 36,
          flexWrap: 'wrap',
        }}>
          <CircleIconButton
            icon="✨"
            label="Take Quiz"
            onClick={() => {/* Step 4 wires /Quiz; tile demoted to secondary
                              until then so the highlighted CTA isn't a no-op */}}
          />
          <CircleIconButton
            icon="📷"
            label="Just Scan"
            active={true}
            onClick={() => navigate('/ColorScanner')}
          />
          {!loading && !session && (
            <CircleIconButton
              icon="🔑"
              label="Sign in"
              onClick={() => navigate('/LogIn')}
            />
          )}
        </div>

        {/* Continue link for authed users (replaces Sign in) */}
        {!loading && session && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button
              onClick={() => navigate('/MyDNA')}
              style={{
                background: 'none', border: 'none',
                color: CLAY, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: SANS,
                letterSpacing: '0.02em',
                padding: '8px 12px',
              }}
            >
              Continue to My DNA  →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
