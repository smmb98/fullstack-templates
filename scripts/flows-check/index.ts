import { checkFeatures, renderIndex } from "../lib/flows";
import {
  APP_DIR,
  E2E_DIR,
  FEATURES_DIR,
  FLOWS_DIR,
  loadFeatures,
  readFlags,
} from "../lib/load-features";
import { nodeFs } from "../lib/node-fs";

async function main() {
  const root = process.cwd();
  const fs = nodeFs(root);
  const features = await loadFeatures(root);
  const problems = checkFeatures({
    metas: features,
    flags: readFlags(root),
    fs,
    appDir: APP_DIR,
    featuresDir: FEATURES_DIR,
    docsFlowsDir: FLOWS_DIR,
    e2eDir: E2E_DIR,
    index: renderIndex(features),
  });

  if (problems.length > 0) {
    console.error(`flows:check failed with ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log(`flows:check ok (${features.length} feature(s))`);
}

await main();
