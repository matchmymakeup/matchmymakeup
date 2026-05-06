// CircleIconButton — v2.1 icon-bearing button vocabulary.
//
// DRMTLGY-pattern: literally circular (icon inside a circle, label below).
// Used for entry tiles (Landing/MyDNA) and ColorScanner action buttons
// (Upload / Camera / Pick Color).
//
// Monochrome chrome per Artefact 2 §7.2 (clay retired 2026-05-02):
//   - Default state: BG_WHITE fill, HAIRLINE border, INK_PRIMARY icon
//   - Active state:  ACCENT_BLACK fill, BG_WHITE icon
//   - Hover (default state only): border tightens HAIRLINE → BORDER_ACTIVE
//   - Disabled: 40% opacity, no hover, no cursor pointer
//
// Props:
//   icon      — ReactNode (emoji string, SVG, or <Component/>)
//   label     — optional string rendered below the circle
//   onClick   — handler (suppressed when disabled)
//   active    — boolean, default false
//   disabled  — boolean, default false
//   size      — 'sm' | 'md' | 'lg', default 'md'

import { useState } from 'react';
import { BG_WHITE, INK_PRIMARY, ACCENT_BLACK, HAIRLINE, BORDER_ACTIVE } from '../lib/design-tokens';

const SIZES = {
  sm: { circle: 48, icon: 18, label: 11 },
  md: { circle: 64, icon: 24, label: 12 },
  lg: { circle: 80, icon: 28, label: 13 },
};

const SANS = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

export default function CircleIconButton({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
  size = 'md',
}) {
  const [hover, setHover] = useState(false);
  const s = SIZES[size] || SIZES.md;

  const circleBg = active ? ACCENT_BLACK : BG_WHITE;
  const circleBorder = active
    ? ACCENT_BLACK
    : (hover ? BORDER_ACTIVE : HAIRLINE);
  const iconColor = active ? BG_WHITE : INK_PRIMARY;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => { if (!disabled) setHover(true); }}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        fontFamily: SANS,
      }}
    >
      <div style={{
        width: s.circle,
        height: s.circle,
        borderRadius: '50%',
        background: circleBg,
        border: `2px solid ${circleBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s.icon,
        color: iconColor,
        transition: 'background 120ms ease, border-color 120ms ease',
      }}>
        {icon}
      </div>
      {label != null && (
        <div style={{
          fontSize: s.label,
          fontWeight: 600,
          color: INK_PRIMARY,
        }}>
          {label}
        </div>
      )}
    </button>
  );
}
