// PillButton — v2.1 text-only button vocabulary.
//
// Pill-shaped (borderRadius: 999). Used for primary CTAs ("Find My
// Match"), secondary text actions ("Continue to My DNA →"), Save
// buttons, and any text-only interactive element.
//
// Monochrome chrome per Artefact 2 §7.2 (clay retired 2026-05-02):
//   - secondary (default): BG_WHITE fill, INK_PRIMARY label, HAIRLINE border
//   - primary or active:   ACCENT_BLACK fill, BG_WHITE label
//   - Hover (secondary): border tightens HAIRLINE → BORDER_ACTIVE
//   - Disabled: 40% opacity, no hover, no cursor pointer
//
// active=true on a secondary takes the primary visual treatment —
// selected and primary CTA share visual weight by intent.
//
// Props:
//   children  — text content
//   onClick   — handler (suppressed when disabled)
//   active    — boolean, default false (selected/toggled state)
//   disabled  — boolean, default false
//   variant   — 'primary' | 'secondary', default 'secondary'
//   size      — 'sm' | 'md' | 'lg', default 'md'

import { useState } from 'react';
import { BG_WHITE, INK_PRIMARY, ACCENT_BLACK, HAIRLINE, BORDER_ACTIVE } from '../lib/design-tokens';

const SIZES = {
  sm: { px: 16, py: 8,  font: 12 },
  md: { px: 22, py: 12, font: 13 },
  lg: { px: 28, py: 14, font: 14 },
};

const SANS = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

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

  const filled = variant === 'primary' || active;

  const bg = filled ? ACCENT_BLACK : BG_WHITE;
  const color = filled ? BG_WHITE : INK_PRIMARY;
  const borderColor = filled
    ? ACCENT_BLACK
    : (hover ? BORDER_ACTIVE : HAIRLINE);

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
