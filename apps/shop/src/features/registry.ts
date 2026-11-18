import catalogFilters from "./catalog-filters/feature.meta";
import catalogListing from "./catalog-listing/feature.meta";
import catalogSort from "./catalog-sort/feature.meta";
import productDetail from "./product-detail/feature.meta";
import search from "./search/feature.meta";
import type { FeatureMeta } from "./types.js";

export const features: FeatureMeta[] = [
  catalogListing,
  catalogSort,
  catalogFilters,
  search,
  productDetail,
];

export function featureById(id: string): FeatureMeta | undefined {
  return features.find((feature) => feature.id === id);
}
