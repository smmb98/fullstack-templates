import { loadFeatures, readFlags } from "../lib/load-features";
import { formatPlan, planReduction } from "../lib/reduce";

function readArgs(argv: string[]) {
  const options = { keep: [] as string[], themes: [] as string[], noLab: false, noDemoControls: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--keep") {
      options.keep = (argv[++index] ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    } else if (arg === "--themes") {
      options.themes = (argv[++index] ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    } else if (arg === "--no-lab") {
      options.noLab = true;
    } else if (arg === "--no-demo-controls") {
      options.noDemoControls = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        "usage: pnpm reduce:plan --keep a,b,c [--themes ink,sand] [--no-lab] [--no-demo-controls]",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument "${arg}". Try --help.`);
    }
  }
  if (options.keep.length === 0) throw new Error("--keep is required, e.g. --keep catalog-listing");
  return options;
}

async function main() {
  const options = readArgs(process.argv.slice(2));
  const root = process.cwd();
  const features = await loadFeatures(root);
  const plan = planReduction(features, readFlags(root), options);
  console.log(formatPlan(plan).join("\n"));
}

await main();
