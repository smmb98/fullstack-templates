import catalogFilters from "./catalog-filters/feature.meta";
import catalogListing from "./catalog-listing/feature.meta";
import catalogSort from "./catalog-sort/feature.meta";
import type { FeatureMeta } from "./types.js";

export const features: FeatureMeta[] = [catalogListing, catalogSort, catalogFilters];

export function featureById(id: string): FeatureMeta | undefined {
  return features.find((feature) => feature.id === id);
}
