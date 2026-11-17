import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { FeatureMetaLike } from "./flows";

export const FEATURES_DIR = "apps/shop/src/features";
export const APP_DIR = "apps/shop/src/app";
export const FLOWS_DIR = "docs/flows";
export const E2E_DIR = "apps/shop/e2e";

const REQUIRED: Array<keyof FeatureMetaLike> = [
  "id",
  "title",
  "flag",
  "routes",
  "endpoints",
  "states",
  "scenarios",
  "dependsOn",
  "tag",
];

export function readFlags(root: string): Record<string, unknown> {
  const file = join(root, "apps/shop/features.config.json");
  if (!existsSync(file)) return {};
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("features.config.json must be an object of flag -> enabled");
  }
  return parsed as Record<string, unknown>;
}

export async function loadFeatures(root: string): Promise<FeatureMetaLike[]> {
  const dir = join(root, ...FEATURES_DIR.split("/"));
  if (!existsSync(dir)) return [];
  const metas: FeatureMetaLike[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = join(dir, entry.name, "feature.meta.ts");
    if (!existsSync(file)) continue;
    const module: unknown = await import(pathToFileURL(file).href);
    const meta = (module as { default?: unknown }).default;
    if (typeof meta !== "object" || meta === null) {
      throw new Error(`${file} must default-export defineFeature({...})`);
    }
    for (const key of REQUIRED) {
      if (!(key in meta)) throw new Error(`${file} is missing "${key}"`);
    }
    metas.push(meta as FeatureMetaLike);
  }

  const ids = new Set<string>();
  for (const meta of metas) {
    if (ids.has(meta.id)) throw new Error(`duplicate feature id "${meta.id}"`);
    ids.add(meta.id);
  }
  return metas.sort((a, b) => a.id.localeCompare(b.id));
}
