/** WCAG contrast checks over the semantic token file. */

export type Theme = "ink" | "sand" | "forest";
export type Scheme = "light" | "dark";

export interface TokenSet {
  theme: Theme;
  scheme: Scheme;
  vars: Record<string, string>;
}

export interface ContrastPair {
  foreground: string;
  background: string;
  /** Minimum ratio: 4.5 for body text, 3 for UI/focus indicators. */
  minimum: number;
  label: string;
}

export const contrastPairs: ContrastPair[] = [
  { foreground: "--fg", background: "--bg", minimum: 4.5, label: "body text on page" },
  { foreground: "--fg-muted", background: "--bg", minimum: 4.5, label: "muted text on page" },
  { foreground: "--fg", background: "--surface", minimum: 4.5, label: "body text on surface" },
  { foreground: "--primary-fg", background: "--primary", minimum: 4.5, label: "button label" },
  { foreground: "--focus-ring", background: "--bg", minimum: 3, label: "focus ring on page" },
];

function blocks(css: string): Array<{ selector: string; body: string }> {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const found: Array<{ selector: string; body: string }> = [];
  let index = 0;
  while (index < source.length) {
    const open = source.indexOf("{", index);
    if (open === -1) break;
    let depth = 1;
    let cursor = open + 1;
    while (cursor < source.length && depth > 0) {
      if (source[cursor] === "{") depth += 1;
      else if (source[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    found.push({ selector: source.slice(index, open).trim(), body: source.slice(open + 1, cursor - 1) });
    index = cursor;
  }
  return found;
}

function declarations(body: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const chunk of body.split(";")) {
    const colon = chunk.indexOf(":");
    if (colon === -1) continue;
    const key = chunk.slice(0, colon).trim();
    const value = chunk.slice(colon + 1).trim();
    if (key.startsWith("--") && value) vars[key] = value;
  }
  return vars;
}

export function parseTokens(css: string): TokenSet[] {
  const root = blocks(css).find((block) => block.selector === ":root");
  const base = root ? declarations(root.body) : {};
  const sets = new Map<string, TokenSet>();

  for (const block of blocks(css)) {
    for (const selector of block.selector.split(",")) {
      const match = /data-theme="(ink|sand|forest)"\]\s*\[data-scheme="(light|dark)"/.exec(selector);
      if (!match) continue;
      const theme = match[1] as Theme;
      const scheme = match[2] as Scheme;
      const key = `${theme}/${scheme}`;
      const existing = sets.get(key)?.vars ?? {};
      sets.set(key, { theme, scheme, vars: { ...base, ...existing, ...declarations(block.body) } });
    }
  }

  const order: Theme[] = ["ink", "sand", "forest"];
  const schemes: Scheme[] = ["light", "dark"];
  return order.flatMap((theme) =>
    schemes.map((scheme) => sets.get(`${theme}/${scheme}`)).filter((set): set is TokenSet => Boolean(set)),
  );
}

function channel(value: number): number {
  const ratio = value / 255;
  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
}

export function parseHex(value: string): [number, number, number] | null {
  const hex = value.trim();
  const short = /^#([0-9a-f]{3})$/i.exec(hex);
  if (short) {
    const [r, g, b] = short[1].split("").map((digit) => parseInt(digit + digit, 16));
    return [r, g, b];
  }
  const long = /^#([0-9a-f]{6})$/i.exec(hex);
  if (long) {
    const number = parseInt(long[1], 16);
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
  }
  return null;
}

export function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const first = parseHex(a);
  const second = parseHex(b);
  if (!first || !second) throw new Error(`Contrast needs hex colours, got "${a}" and "${b}"`);
  const l1 = relativeLuminance(first);
  const l2 = relativeLuminance(second);
  const [light, dark] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

export interface ContrastFailure {
  theme: Theme;
  scheme: Scheme;
  pair: ContrastPair;
  ratio: number;
  foreground: string;
  background: string;
}

export function checkContrast(
  tokens: readonly TokenSet[],
  pairs: readonly ContrastPair[] = contrastPairs,
): ContrastFailure[] {
  const failures: ContrastFailure[] = [];
  for (const set of tokens) {
    for (const pair of pairs) {
      const foreground = set.vars[pair.foreground];
      const background = set.vars[pair.background];
      if (!foreground || !background) {
        throw new Error(`${set.theme}/${set.scheme} is missing ${pair.foreground} or ${pair.background}`);
      }
      const ratio = contrastRatio(foreground, background);
      if (ratio + 1e-9 < pair.minimum) {
        failures.push({
          theme: set.theme,
          scheme: set.scheme,
          pair,
          ratio,
          foreground,
          background,
        });
      }
    }
  }
  return failures;
}
