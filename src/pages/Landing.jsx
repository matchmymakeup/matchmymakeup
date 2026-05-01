// v2.1 Page-1 entry — speed-mode build for Desiree-review demo.
// Cream/clay/serif aesthetic. New app root (replaces / → /Home redirect).
//
// Three entry tiles styled to match rebuilt MyDNA tiles for visual
// consistency. English-only per speed-mode brief.
//
// Wiring:
//   Take Quiz  → no-op (Step 4 builds /Quiz)
//   Just Scan  → /ColorScanner (no auth gate, anon flow)
//   Sign in    → /LogIn (anon-only; authed users see "Continue to My DNA")

import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/auth";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "'Segoe UI', system-ui, -apple-system, sans-serif";
const CREAM = '#F5F1EA';
const WHITE = '#FFFFFF';
const INK   = '#1A1A1A';
const CLAY  = '#9C5B4A';
const HAIRLINE = 'rgba(26,26,26,0.08)';
const DIM   = 'rgba(26,26,26,0.55)';

const tileBase = {
  background: WHITE,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 14,
  padding: '22px 12px',
  cursor: 'pointer',
  fontFamily: SANS,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  minHeight: 120,
};
const tilePrimary = { ...tileBase, border: `2px solid ${CLAY}` };

export default function Landing() {
  const { session, loading } = useUser();
  const navigate = useNavigate();

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
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
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

        {/* Entry tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 8,
          marginBottom: 36,
        }}>
          <button onClick={() => {/* Step 4 wires /Quiz */}} style={tilePrimary}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>✨</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginTop: 6 }}>Take Quiz</div>
          </button>
          <button onClick={() => navigate('/ColorScanner')} style={tileBase}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>📷</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginTop: 6 }}>Just Scan</div>
          </button>
          {!loading && !session && (
            <button onClick={() => navigate('/LogIn')} style={tileBase}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>🔑</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginTop: 6 }}>Sign in</div>
            </button>
          )}
        </div>

        {/* Continue link for authed users (replaces Sign-in tile) */}
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
