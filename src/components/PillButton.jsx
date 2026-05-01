// PillButton — v2.1 text-only button vocabulary.
//
// Pill-shaped (borderRadius: 999). Used for primary CTAs ("Find My
// Match"), secondary text actions ("Continue to My DNA →"), Save
// buttons, and any text-only interactive element.
//
// v2.1 button vocabulary rules:
//   - secondary (default): white background, ink text, hairline border
//   - primary: clay background, cream text (no visible border)
//   - active on secondary: clay background, cream text — selected state
//     and primary CTA share visual weight intentionally
//   - Hover: border/bg shifts subtly; on primary or active, darker clay
//   - Disabled: 40% opacity, no hover, no cursor pointer
//
// Props:
//   children  — text content
//   onClick   — handler (suppressed when disabled)
//   active    — boolean, default false (selected/toggled state)
//   disabled  — boolean, default false
//   variant   — 'primary' | 'secondary', default 'secondary'
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
  sm: { px: 16, py: 8,  font: 12 },
  md: { px: 22, py: 12, font: 13 },
  lg: { px: 28, py: 14, font: 14 },
};

const SANS = "'Segoe UI', system-ui, -apple-system, sans-serif";

export default function PillButton({
  children,
  onClick,
  active = false,
  disabled = false,
  variant = 'secondary',
  size = 'md',
}) {
  const [hover, setHover] = useState(false);
  const s = SIZES[size] || SIZES.md;

  // Active state on secondary takes the primary visual treatment
  // (clay-filled). Explicit `variant='primary'` is the same.
  const filled = variant === 'primary' || active;

  const bg = filled
    ? (hover ? PALETTE.clayHover : PALETTE.clay)
    : PALETTE.white;
  const color = filled ? PALETTE.white : PALETTE.ink;
  const borderColor = filled
    ? (hover ? PALETTE.clayHover : PALETTE.clay)
    : (hover ? PALETTE.hairlineHover : PALETTE.hairline);

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => { if (!disabled) setHover(true); }}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        background: bg,
        border: `2px solid ${borderColor}`,
        borderRadius: 999,
        padding: `${s.py}px ${s.px}px`,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontSize: s.font,
        fontWeight: 600,
        color,
        fontFamily: SANS,
        transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      {children}
    </button>
  );
}
