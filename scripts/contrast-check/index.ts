import { readFileSync } from "node:fs";
import { join } from "node:path";
import { checkContrast, parseTokens, type ContrastFailure } from "../lib/contrast";

const TOKENS = "packages/ui/src/styles/tokens.css";

function describe(failure: ContrastFailure): string {
  return [
    `${failure.theme}/${failure.scheme}`,
    failure.pair.label,
    `${failure.foreground} on ${failure.background}`,
    `${failure.ratio.toFixed(2)}:1`,
    `needs ${failure.pair.minimum}:1`,
  ].join(" | ");
}

function main() {
  const root = process.cwd();
  const css = readFileSync(join(root, ...TOKENS.split("/")), "utf8");
  const tokens = parseTokens(css);

  const expected = 3 * 2;
  if (tokens.length !== expected) {
    console.error(`contrast:check expected ${expected} theme/scheme sets, found ${tokens.length}`);
    process.exitCode = 1;
    return;
  }

  const failures = checkContrast(tokens);
  if (failures.length > 0) {
    console.error(`contrast:check failed (${failures.length} pair(s)):`);
    for (const failure of failures) console.error(`  - ${describe(failure)}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `contrast:check ok (${tokens.length} theme/scheme sets, ${tokens.length * 5} pairs >= WCAG AA)`,
  );
}

main();
