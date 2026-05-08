// Color-science utilities for MyDNAArtefactCard data fields per Artefact 2 §6.2.
// rgbToLab: sRGB → linear RGB → XYZ (D65) → CIELAB (CIE 1976 L*a*b*).
// seasonToMetallic: warm-base seasons → Gold, cool-base → Silver.
// Boundary-case rose gold (B−A ∈ [4.5, 5.5]) deferred to palette-mapping brief.

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function f(t) {
  const delta = 6 / 29;
  return t > delta * delta * delta
    ? Math.cbrt(t)
    : t / (3 * delta * delta) + 4 / 29;
}

export function rgbToLab({ r, g, b }) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const X = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  const Y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
  const Z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;

  const fx = f(X / 0.95047);
  const fy = f(Y / 1.00000);
  const fz = f(Z / 1.08883);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function seasonToMetallic(season) {
  if (!season) return null;
  const s = String(season).toLowerCase();
  if (s.startsWith('spring') || s.startsWith('autumn')) return 'Gold';
  if (s.startsWith('summer') || s.startsWith('winter')) return 'Silver';
  return null;
}
