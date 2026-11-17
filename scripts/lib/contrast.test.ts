import { describe, expect, it } from "vitest";
import { checkContrast, contrastRatio, parseHex, parseTokens } from "./contrast";

const css = `
:root { --fg: #111111; --bg: #ffffff; }
[data-theme="ink"][data-scheme="light"],
[data-theme="ink"][data-scheme="system"][data-scheme-resolved="light"] {
  --fg: #121317; --bg: #f6f6f4; --fg-muted: #545a64; --surface: #ffffff;
  --primary: #1d4ed8; --primary-fg: #ffffff; --focus-ring: #1d4ed8;
}
[data-theme="ink"][data-scheme="dark"] {
  --fg: #f3f4f6; --bg: #0f1013; --fg-muted: #a8adb8; --surface: #17191d;
  --primary: #8fb0ff; --primary-fg: #0a1020; --focus-ring: #8fb0ff;
}
`;

describe("contrast", () => {
  it("computes WCAG ratios for hex colours", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(parseHex("#fff")).toEqual([255, 255, 255]);
    expect(parseHex("rgb(0,0,0)")).toBeNull();
  });

  it("parses theme/scheme blocks and skips the system-resolved duplicate", () => {
    const tokens = parseTokens(css);
    expect(tokens.map((set) => `${set.theme}/${set.scheme}`)).toEqual(["ink/light", "ink/dark"]);
    expect(tokens[0].vars["--bg"]).toBe("#f6f6f4");
  });

  it("fails pairs below the minimum", () => {
    const [light, dark] = parseTokens(css);
    expect(checkContrast([light])).toEqual([]);
    const failures = checkContrast([dark], [
      { foreground: "--fg-muted", background: "--bg", minimum: 10, label: "strict" },
    ]);
    expect(failures).toHaveLength(1);
    expect(failures[0].ratio).toBeGreaterThan(4.5);
  });
});
