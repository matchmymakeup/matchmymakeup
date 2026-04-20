export function getColourName(r, g, b) {
  // Convert RGB to HSL
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }

  // Near-black
  if (l < 0.08) return "Noir";
  if (l < 0.14) return "Onyx";
  if (l < 0.2) return "Midnight";
  if (l < 0.25 && s < 0.2) return "Espresso";

  // Near-white / very light neutrals
  if (l > 0.93 && s < 0.15) return "Ivory";
  if (l > 0.88 && s < 0.15) return "Parchment";
  if (l > 0.82 && s < 0.15) return "Linen";

  // Grays (low saturation)
  if (s < 0.12) {
    if (l > 0.7) return "Urban Mist";
    if (l > 0.5) return "Pewter";
    if (l > 0.35) return "Storm Cloud";
    return "Smoky Quartz";
  }

  // Low saturation warm/cool neutrals
  if (s < 0.25) {
    if (h >= 20 && h < 45) return l > 0.6 ? "Sand" : "Stone";
    if (h >= 10 && h < 20) return l > 0.5 ? "Parchment" : "Toffee";
    if (l > 0.65) return "Linen";
    return "Stone";
  }

  // Chromatic colours by hue
  // Reds (345-15)
  if (h >= 345 || h < 15) {
    if (l > 0.7) return "Blush";
    if (l > 0.5) return "Scarlet";
    if (l > 0.35) return "Ruby";
    if (l > 0.25) return "Crimson";
    return "Berry";
  }
  // Oranges / corals (15-45)
  if (h >= 15 && h < 45) {
    if (l > 0.75) return "Peach";
    if (l > 0.6) return s > 0.5 ? "Coral Kiss" : "Sand";
    if (l > 0.45) return s > 0.6 ? "Tangerine" : "Amber";
    if (l > 0.35) return "Terracotta";
    return "Cocoa";
  }
  // Browns / nudes (45-65)
  if (h >= 45 && h < 65) {
    if (l > 0.75) return "Parchment";
    if (l > 0.55) return "Caramel";
    if (l > 0.4) return "Toffee";
    return "Cocoa";
  }
  // Yellows / golds (65-90) — mapped to warm nudes
  if (h >= 65 && h < 90) {
    if (l > 0.7) return "Sand";
    if (l > 0.5) return "Amber";
    return "Caramel";
  }
  // Greens (90-165) — rare in makeup but handle gracefully
  if (h >= 90 && h < 165) {
    if (l > 0.6) return "Pistachio";
    if (l > 0.35) return "Jade";
    return "Emerald";
  }
  // Teals / cyans (165-200)
  if (h >= 165 && h < 200) {
    if (l > 0.6) return "Aquamarine";
    return "Teal";
  }
  // Blues (200-260) — rare in makeup
  if (h >= 200 && h < 260) {
    if (l > 0.6) return "Cornflower";
    if (l > 0.35) return "Sapphire";
    return "Midnight";
  }
  // Purples (260-310)
  if (h >= 260 && h < 310) {
    if (l > 0.7) return "Lavender";
    if (l > 0.5) return "Amethyst";
    if (l > 0.35) return "Plum";
    return "Grape";
  }
  // Pinks / magentas (310-345)
  if (h >= 310 && h < 345) {
    if (l > 0.75) return "Ballet Slipper";
    if (l > 0.6) return "Rose Petal";
    if (l > 0.45) return "Bubblegum";
    return "Berry";
  }
  return "Stone";
}
