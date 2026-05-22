// Munsell-derived shade naming for v2.1.
//
// Produces canonical season keys for the data layer (profiles.season) and
// region-localised English display strings ("Fall" Northern vs "Autumn"
// Southern). See docs/design/v2.1/decisions.md (#9) for spec and
// matchmymakeup_v2_1_season_convention memory for architecture rationale.
//
// SCOPE: this module ships with placeholder season-classification + descriptor
// logic so the v2.1 build can wire up display strings end-to-end. Phase 3
// replaces classifySeasonApprox + descriptorApprox with Desiree's proper
// Munsell-renotation methodology. Public API (getHemisphere, classifyShade,
// formatShadeName, seasonDisplayEN) is stable and won't move.

// ─── Country → hemisphere ───────────────────────────────────────────────
// 2-entry result space ('N' | 'S'). Equatorial / straddling countries default
// per the locked rules: BR/ID Southern (majority pop. south), IN/NG/SG and all
// other equatorial → Northern fallback.
const SOUTHERN_COUNTRIES = new Set([
  'AU', 'NZ', 'ZA',
  'AR', 'BO', 'CL', 'PY', 'PE', 'UY',
  'BR', 'ID',
]);

// Writer-side (ColorScanner SHOP_IN_OPTIONS, /api/match, /api/advice) uses
// full country names; profile.country_code (migration 0004) uses ISO. Accept
// both at the boundary — full names map to ISO, ISO and unknowns pass through.
const NAME_TO_ISO = {
  'USA': 'US', 'Australia': 'AU', 'India': 'IN', 'Brazil': 'BR', 'China': 'CN',
  'Indonesia': 'ID', 'Nigeria': 'NG', 'Philippines': 'PH', 'South Africa': 'ZA',
};

function normaliseCountry(c) {
  return NAME_TO_ISO[c] || c;
}

export function getHemisphere(countryCode) {
  if (!countryCode) return 'N';
  const iso = normaliseCountry(countryCode);
  return SOUTHERN_COUNTRIES.has(iso.toUpperCase()) ? 'S' : 'N';
}

// ─── Hex → HSL helper ────────────────────────────────────────────────────
function hexToHsl(hex) {
  const m = String(hex || '').replace('#', '');
  if (m.length !== 6) return { h: 0, s: 0, l: 0 };
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

// ─── Approximate Munsell value + chroma ──────────────────────────────────
// PLACEHOLDER: value ≈ HSL lightness × 10; chroma ≈ saturation × lightness
// adjustment. Replaced by Desiree's Munsell-renotation lookup in Phase 3.
function munsellApprox(hex) {
  const { s, l } = hexToHsl(hex);
  const valueMunsell = Math.round(l * 10);
  const chromaMunsell = Math.round(s * Math.min(l * 2, 1) * 10);
  return { valueMunsell, chromaMunsell };
}

// ─── Season classification ───────────────────────────────────────────────
// PLACEHOLDER: warm hues (red/orange/yellow + magenta) split by lightness
// → spring/autumn; cool hues split by lightness → summer/winter. Replaced
// by Phase 3 12-season Munsell methodology.
function classifySeasonApprox(hex) {
  const { h, l } = hexToHsl(hex);
  const warm = h < 90 || h >= 270;
  if (warm) return l >= 0.5 ? 'spring' : 'autumn';
  return l >= 0.5 ? 'summer' : 'winter';
}

// ─── Descriptor ──────────────────────────────────────────────────────────
// PLACEHOLDER: coarse {intensity}{family} in English. Phase 3 will replace
// with a curated named-colour lookup driven by Munsell-renotation neighbours.
function descriptorApprox(hex) {
  const { h, s, l } = hexToHsl(hex);
  const intensity = s < 0.2 ? 'Soft' : s < 0.5 ? 'Muted' : 'Bright';
  let family;
  if (s > 0.1) {
    if (h < 20) family = 'Red';
    else if (h < 45) family = 'Orange';
    else if (h < 70) family = 'Yellow';
    else if (h < 165) family = 'Green';
    else if (h < 255) family = 'Blue';
    else if (h < 320) family = 'Purple';
    else family = 'Pink';
  } else {
    family = l > 0.7 ? 'Beige' : l > 0.4 ? 'Taupe' : 'Brown';
  }
  return `${intensity} ${family}`;
}

// ─── English display: Northern "Fall" override ───────────────────────────
// Other locales pass through the canonical key — callers translate using
// their existing per-component i18n maps. The Fall/Autumn split is
// English-only (Spanish "otoño", Portuguese "outono", etc. are stable
// across hemispheres).
const NORTHERN_EN = { spring: 'Spring', summer: 'Summer', autumn: 'Fall',   winter: 'Winter' };
const SOUTHERN_EN = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };

export function seasonDisplayEN(canonicalKey, hemisphere) {
  const map = hemisphere === 'N' ? NORTHERN_EN : SOUTHERN_EN;
  return map[canonicalKey] || canonicalKey;
}

// ─── Public: classify + format ───────────────────────────────────────────
// Returns the data-layer payload for storage on profiles or saved shades.
// canonicalSeasonKey uses Commonwealth spelling ('autumn'); display layer
// applies the hemisphere transform separately.
export function classifyShade(hex, countryCode) {
  const canonicalSeasonKey = classifySeasonApprox(hex);
  const hemisphere = getHemisphere(countryCode);
  const { valueMunsell, chromaMunsell } = munsellApprox(hex);
  const descriptor = descriptorApprox(hex);
  return { canonicalSeasonKey, hemisphere, valueMunsell, chromaMunsell, descriptor };
}

// English-only display formatter. Non-English callers should compose using
// classifyShade() + their own locale season-name map + descriptor.
//
// Format is `<descriptor> · <season> <value>/<chroma>` — slash matches
// standard Munsell practitioner notation and resolves 2-digit-chroma
// ambiguity (e.g. "7/10" reads cleanly where "7.10" would not).
//
//   formatShadeName('#D4A88C', 'AU') → "Muted Orange · Autumn 6/4"
//   formatShadeName('#D4A88C', 'US') → "Muted Orange · Fall 6/4"
export function formatShadeName(hex, countryCode) {
  const r = classifyShade(hex, countryCode);
  const seasonText = seasonDisplayEN(r.canonicalSeasonKey, r.hemisphere);
  return `${r.descriptor} · ${seasonText} ${r.valueMunsell}/${r.chromaMunsell}`;
}
