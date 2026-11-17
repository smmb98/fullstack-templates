import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderIndex } from "../lib/flows";
import { FLOWS_DIR, loadFeatures } from "../lib/load-features";

async function main() {
  const root = process.cwd();
  const features = await loadFeatures(root);
  const index = renderIndex(features);
  const dir = join(root, ...FLOWS_DIR.split("/"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "INDEX.md"), index, "utf8");
  console.log(`flows:gen wrote ${FLOWS_DIR}/INDEX.md (${features.length} feature(s))`);
}

await main();
