// src/lib/design-tokens.js — single source of truth per Artefact 2 §7.2

// Background — Artefact 2 §7.2: neutral white or near-white
export const BG_WHITE = '#FFFFFF';      // primary page background
export const BG_OFFWHITE = '#FAFAFA';   // secondary/elevated card surfaces

// Foreground — Artefact 2 §7.2: near-black primary; mid-grey secondary
export const INK_PRIMARY = '#1A1A1A';
export const INK_SECONDARY = '#666666';

// Accent — Artefact 2 §7.2: single accent black for primary CTAs only
export const ACCENT_BLACK = '#000000';

// Hairlines + borders (monochrome differentiation per Artefact 6 §3.3)
export const HAIRLINE = 'rgba(26,26,26,0.10)';           // default subtle separator
export const PLACEHOLDER_BORDER = 'rgba(26,26,26,0.25)'; // empty-state/placeholder tier (between HAIRLINE and BORDER_ACTIVE)
export const BORDER_ACTIVE = '#1A1A1A';                  // selected/active state border (full ink)

// Surface — Artefact 2 §7.2: pure shadow without colour cast
export const SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)';
