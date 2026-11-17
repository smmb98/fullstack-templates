import type { FeatureMetaLike } from "./flows";

export interface ReductionOptions {
  keep: string[];
  themes?: string[];
  noLab?: boolean;
  noDemoControls?: boolean;
}

export interface ReductionPlan {
  kept: string[];
  removed: string[];
  folders: string[];
  routes: string[];
  cards: string[];
  specs: string[];
  endpoints: string[];
  flags: string[];
  notes: string[];
}

export function resolveKeepSet(metas: readonly FeatureMetaLike[], keep: readonly string[]): string[] {
  const byId = new Map(metas.map((meta) => [meta.id, meta]));
  const unknown = keep.filter((id) => !byId.has(id));
  if (unknown.length > 0) throw new Error(`Unknown feature(s): ${unknown.join(", ")}`);

  const kept = new Set<string>();
  const visit = (id: string) => {
    if (kept.has(id)) return;
    kept.add(id);
    for (const dependency of byId.get(id)?.dependsOn ?? []) visit(dependency);
  };
  for (const id of keep) visit(id);
  return [...kept].sort();
}

export function planReduction(
  metas: readonly FeatureMetaLike[],
  flags: Record<string, unknown>,
  options: ReductionOptions,
): ReductionPlan {
  const kept = resolveKeepSet(metas, options.keep);
  const keptSet = new Set(kept);
  const removedMetas = metas.filter((meta) => !keptSet.has(meta.id));
  const keptMetas = metas.filter((meta) => keptSet.has(meta.id));

  const endpoints = new Set(keptMetas.flatMap((meta) => meta.endpoints));
  const removedEndpoints = new Set(
    removedMetas.flatMap((meta) => meta.endpoints).filter((endpoint) => !endpoints.has(endpoint)),
  );

  const notes: string[] = [];
  if (options.themes && options.themes.length > 0) {
    notes.push(`keep only themes: ${options.themes.join(", ")} (edit packages/ui tokens + preset)`);
  }
  if (options.noLab) notes.push("remove Theme Lab (flag + slice + nav entry)");
  if (options.noDemoControls) notes.push("remove Demo Controls (flag, middleware, scenario cookie reads)");

  const removedFlags = removedMetas.map((meta) => meta.flag);
  for (const flag of Object.keys(flags)) {
    if (removedFlags.includes(flag)) continue;
    if (keptMetas.some((meta) => meta.flag === flag)) continue;
    notes.push(`orphaned flag in features.config.json: ${flag}`);
  }

  return {
    kept,
    removed: removedMetas.map((meta) => meta.id),
    folders: removedMetas.map((meta) => `apps/shop/src/features/${meta.id}`),
    routes: removedMetas.flatMap((meta) => meta.routes),
    cards: removedMetas.map((meta) => `docs/flows/${meta.id}.md`),
    specs: removedMetas.map((meta) => `apps/shop/e2e/${meta.id}.spec.ts`),
    endpoints: [...removedEndpoints].sort(),
    flags: removedFlags.sort(),
    notes,
  };
}

export function formatPlan(plan: ReductionPlan): string[] {
  const section = (title: string, values: readonly string[]) =>
    values.length === 0 ? [] : [`${title}:`, ...values.map((value) => `  - ${value}`)];

  const lines = [
    "reduce:plan (dry run, nothing is deleted)",
    `keep: ${plan.kept.join(", ") || "(none)"}`,
    `remove: ${plan.removed.join(", ") || "(none)"}`,
    ...section("folders", plan.folders),
    ...section("routes", plan.routes),
    ...section("flow cards", plan.cards),
    ...section("e2e specs", plan.specs),
    ...section("endpoints", plan.endpoints),
    ...section("flags", plan.flags),
    ...section("notes", plan.notes),
    "",
    "Ask the human to approve this list before deleting anything.",
  ];
  return lines;
}
