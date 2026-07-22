/* Colour helpers for theming. Given one "primary" colour (the 600 shade),
   we generate the full 50→900 scale by mixing toward white (lighter) and
   black (darker). Predictable and works for any colour. */

const clamp = (n) => Math.max(0, Math.min(255, n));

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => clamp(Math.round(x)).toString(16).padStart(2, "0")).join("");
}

// blend a toward b by fraction t (0..1)
function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.r + (B.r - A.r) * t, A.g + (B.g - A.g) * t, A.b + (B.b - A.b) * t);
}

const WHITE = "#ffffff";
const BLACK = "#000000";

export function generateScale(hex) {
  return {
    50: mix(WHITE, hex, 0.06),
    100: mix(WHITE, hex, 0.12),
    200: mix(WHITE, hex, 0.26),
    300: mix(WHITE, hex, 0.44),
    400: mix(WHITE, hex, 0.66),
    500: mix(WHITE, hex, 0.85),
    600: hex,
    700: mix(BLACK, hex, 0.82),
    800: mix(BLACK, hex, 0.68),
    900: mix(BLACK, hex, 0.56),
  };
}

export const isHex = (s) => /^#[0-9a-fA-F]{6}$/.test(s);
