import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderSummary, summarizeReport, type PlaywrightReport } from "../lib/e2e-report";

const DEFAULT_REPORT = "apps/shop/test-results/report.json";

function main() {
  const root = process.cwd();
  const relative = process.argv[2] ?? DEFAULT_REPORT;
  const file = join(root, ...relative.split("/"));

  if (!existsSync(file)) {
    console.error(`e2e:summary: no report at ${relative}. Run ./dev e2e first.`);
    process.exitCode = 1;
    return;
  }

  const report: PlaywrightReport = JSON.parse(readFileSync(file, "utf8"));
  const summary = summarizeReport(report);
  console.log(renderSummary(summary));
  if (summary.failures > 0) process.exitCode = 1;
}

main();
