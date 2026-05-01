// CircleIconButton — v2.1 icon-bearing button vocabulary.
//
// DRMTLGY-pattern: literally circular (icon inside a circle, label below).
// Used for entry tiles (Landing/MyDNA) and ColorScanner action buttons
// (Upload / Camera / Pick Color).
//
// v2.1 button vocabulary rules:
//   - Default state: white circle, hairline border, ink icon
//   - Active state: clay-filled circle, cream icon (strong, unambiguous)
//   - Hover: border darkens; on active, slightly darker clay
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

const PALETTE = {
  white: '#FFFFFF',
  ink: '#1A1A1A',
  clay: '#9C5B4A',
  clayHover: '#8A4F40',
  hairline: 'rgba(26,26,26,0.15)',
  hairlineHover: 'rgba(26,26,26,0.4)',
};

const SIZES = {
  sm: { circle: 48, icon: 18, label: 11 },
  md: { circle: 64, icon: 24, label: 12 },
  lg: { circle: 80, icon: 28, label: 13 },
};

const SANS = "'Segoe UI', system-ui, -apple-system, sans-serif";

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

  const circleBg = active
    ? (hover ? PALETTE.clayHover : PALETTE.clay)
    : PALETTE.white;
  const circleBorder = active
    ? (hover ? PALETTE.clayHover : PALETTE.clay)
    : (hover ? PALETTE.hairlineHover : PALETTE.hairline);
  const iconColor = active ? PALETTE.white : PALETTE.ink;

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
          color: PALETTE.ink,
        }}>
          {label}
        </div>
      )}
    </button>
  );
}
