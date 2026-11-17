import type { FeatureMeta } from "./types.js";

export const features: FeatureMeta[] = [];

export function featureById(id: string): FeatureMeta | undefined {
  return features.find((feature) => feature.id === id);
}
