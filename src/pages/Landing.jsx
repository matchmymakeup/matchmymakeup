// v2.1 Page-1 entry — PR4 rebuild using shared button vocabulary.
// Monochrome chrome (Artefact 2 §7.2); CircleIconButton entry tiles; Dropdown
// consultant selector wired to sessionStorage 'mmm_language' (same key
// ColorScanner.jsx:352 reads from). English-only chrome per speed-mode.
//
// Wiring:
//   Take Quiz  → tile HIDDEN until PR7 wires /Quiz. Was demoted to
//                secondary in PR4.5; in PR6 removed entirely from the
//                entry tile row to avoid a dead-end visible CTA. Re-add
//                with active=true when /Quiz lands.
//   Just Scan  → /ColorScanner (no auth gate, anon flow). active=true
//                marks the highlighted recommended path until quiz lands.
//   Sign in    → /LogIn (anon-only; authed users see "Continue to My
//                DNA →" link instead).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/auth";
import CircleIconButton from "../components/CircleIconButton";
import Dropdown from "../components/Dropdown";
import { BG_WHITE, INK_PRIMARY, INK_SECONDARY, HAIRLINE } from "../lib/design-tokens";

const SERIF = "'DM Serif Display', Georgia, serif";
const SANS  = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

// 15 personas, slash-separated <Language> / <Persona> / <Region> labels
// (locked 2026-05-02). Inlined here vs centralising to src/lib/personas.js
// — deliberate duplication for speed-mode scope. Two pre-existing persona
// definitions live elsewhere (ColorScanner.jsx:420 UI, api/advice.js:71
// server-side culture/lang). DRY violation banked, polish-pass refactor.
const PERSONA_OPTIONS = [
  { value: 'en', icon: '🌍', label: 'English / Maya / Global' },
  { value: 'hi', icon: '🇮🇳', label: 'Hindi / Priya / India' },
  { value: 'pt', icon: '🇧🇷', label: 'Portuguese / Valentina / Brazil' },
  { value: 'zh', icon: '🇨🇳', label: 'Mandarin / Mei / China' },
  { value: 'id', icon: '🇮🇩', label: 'Bahasa / Sari / Indonesia' },
  { value: 'ng', icon: '🇳🇬', label: 'Pidgin / Adaeze / Nigeria' },
  { value: 'es', icon: '🇲🇽', label: 'Spanish / Isabella / Latin America' },
  { value: 'ar', icon: '🇪🇬', label: 'Arabic / Layla / MENA' },
  { value: 'fr', icon: '🇫🇷', label: 'French / Céline / France' },
  { value: 'bn', icon: '🇧🇩', label: 'Bengali / Ananya / Bangladesh' },
  { value: 'sw', icon: '🇹🇿', label: 'Swahili / Amara / East Africa' },
  { value: 'tl', icon: '🇵🇭', label: 'Tagalog / Gabriela / Philippines' },
  { value: 'af', icon: '🇿🇦', label: 'Afrikaans / Liezel / South Africa' },
  { value: 'zu', icon: '🇿🇦', label: 'Zulu / Nomvula / South Africa' },
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
    <div style={{ minHeight: '100vh', background: BG_WHITE }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 60px' }}>

        {/* Wordmark + tagline lockup — v2.1 monochrome-on-light, mirrors
            the MyDNA/MatchResults pattern scaled for landing presence.
            ™ resets letter-spacing so the superscript sits tight to the
            final wordmark glyph. */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: 28,
            fontWeight: 400,
            color: INK_PRIMARY,
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}>
            MatchMyMakeup<span style={{
              fontSize: 12,
              verticalAlign: 'super',
              color: INK_SECONDARY,
              letterSpacing: 0,
              fontWeight: 400,
            }}>{'™'}</span>
          </div>
          <div style={{
            marginTop: 6,
            fontFamily: SANS,
            fontSize: 9,
            fontWeight: 600,
            color: INK_SECONDARY,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            AI Beauty Intelligence
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 400,
            color: INK_PRIMARY,
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
            color: INK_SECONDARY,
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
          {/* Take Quiz tile hidden until PR7 wires /Quiz. Re-add as
              active={true} (recommended path) when the route exists. */}
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
                color: INK_PRIMARY, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: SANS,
                letterSpacing: '0.02em',
                padding: '8px 12px',
              }}
            >
              Continue to My DNA  →
            </button>
          </div>
        )}

        {/* Tier ladder — informational band above legal footer. PR-F-light.15. */}
        <div style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: `1px solid ${HAIRLINE}`,
          fontFamily: SANS,
          fontSize: 12,
          color: INK_SECONDARY,
          lineHeight: 1.9,
          textAlign: 'center',
        }}>
          <div>Free — Scan &amp; match basics</div>
          <div>Premium A$4.99/mo — Full matches + CIELAB + advice</div>
          <div>Premium+ A$9.99/mo — Personal Beauty Library</div>
        </div>

        {/* Footer — regulatory document discoverability per APP1 / GDPR / POPIA / LGPD / DPDP / CCPA */}
        <div style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: `1px solid ${HAIRLINE}`,
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          fontFamily: SANS,
          fontSize: 12,
          color: INK_SECONDARY,
        }}>
          <span
            onClick={() => navigate('/Privacy')}
            style={{ cursor: 'pointer' }}
          >
            Privacy
          </span>
          <span>·</span>
          <span
            onClick={() => navigate('/Terms')}
            style={{ cursor: 'pointer' }}
          >
            Terms
          </span>
        </div>
      </div>
    </div>
  );
}
