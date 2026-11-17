/** Deterministic, local, dependency-free placeholder art. */

export interface PlaceholderInput {
  slug: string;
  title: string;
  width?: number;
  height?: number;
}

export interface Palette {
  background: string;
  shapes: [string, string, string];
  line: string;
}

export const palettes: Record<"ink" | "sand" | "forest", Palette> = {
  ink: { background: "#e8eaf0", shapes: ["#1d4ed8", "#8fb0ff", "#b45309"], line: "#121317" },
  sand: { background: "#f3e7d6", shapes: ["#9a3d1c", "#e0b48c", "#0f766e"], line: "#241b13" },
  forest: { background: "#e2ece4", shapes: ["#1c5b3d", "#86c9a4", "#8a6a1f"], line: "#102018" },
};

export const paletteNames = ["ink", "sand", "forest"] as const;

export function hashSlug(slug: string): number {
  let hash = 2166136261;
  for (let index = 0; index < slug.length; index += 1) {
    hash ^= slug.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Same slug and index always produce byte-identical SVG. */
export function renderPlaceholder(input: PlaceholderInput, index: number): string {
  const width = input.width ?? 800;
  const height = input.height ?? 600;
  const seed = hashSlug(input.slug);
  const random = mulberry32(seed + index * 7919);
  const palette = palettes[paletteNames[(seed + index) % paletteNames.length]];

  const circle = {
    cx: Math.round(width * (0.25 + random() * 0.5)),
    cy: Math.round(height * (0.25 + random() * 0.4)),
    r: Math.round(Math.min(width, height) * (0.18 + random() * 0.14)),
  };
  const arch = {
    x: Math.round(width * (0.1 + random() * 0.35)),
    y: Math.round(height * (0.45 + random() * 0.2)),
    w: Math.round(width * 0.28),
    h: Math.round(height * 0.4),
  };
  const stripeCount = 3 + Math.floor(random() * 3);
  const stripes = Array.from({ length: stripeCount }, (_, stripe) => {
    const y = Math.round(height * 0.78 - stripe * 14);
    return `    <rect x="${Math.round(width * 0.08)}" y="${y}" width="${Math.round(
      width * (0.2 + random() * 0.25),
    )}" height="4" fill="${palette.line}" opacity="0.25" />`;
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(input.title)}">`,
    "  <title>" + escapeXml(input.title) + "</title>",
    `  <rect width="${width}" height="${height}" fill="${palette.background}" />`,
    `  <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="${palette.shapes[0]}" opacity="0.9" />`,
    `  <rect x="${arch.x}" y="${arch.y}" width="${arch.w}" height="${arch.h}" rx="${Math.round(
      arch.w / 2,
    )}" fill="${palette.shapes[1]}" opacity="0.85" />`,
    `  <circle cx="${Math.round(width * 0.72)}" cy="${Math.round(height * 0.62)}" r="${Math.round(
      Math.min(width, height) * 0.12,
    )}" fill="${palette.shapes[2]}" opacity="0.9" />`,
    ...stripes,
    "</svg>",
    "",
  ].join("\n");
}
