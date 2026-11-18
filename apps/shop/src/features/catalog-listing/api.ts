import type { ProductListResponse, ProductSort } from "@fullstack-templates/api-contract";
import { productsListEndpoint } from "@fullstack-templates/api-contract";
import {
  filterParams,
  type CatalogFilterState,
} from "@/features/catalog-filters";
import { sortParamValue } from "@/features/catalog-sort";
import { apiRequest } from "@/lib/api-client";

export type ListingView = "grid" | "list";

export interface ListingQuery extends CatalogFilterState {
  q?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  view?: ListingView;
}

export const listingKeys = {
  all: ["catalog-listing"] as const,
  list: (query: ListingQuery) => [...listingKeys.all, "list", query] as const,
};

function csv(values: string[]): string | undefined {
  return values.length > 0 ? values.join(",") : undefined;
}

export function fetchProducts(query: ListingQuery): Promise<ProductListResponse> {
  return apiRequest(productsListEndpoint, {
    query: {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 12,
      sort: query.sort ?? "relevance",
      q: query.q,
      category: query.category,
      brand: csv(query.brands),
      color: csv(query.colors),
      material: csv(query.materials),
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minRating: query.minRating,
      inStock: query.inStock ? "true" : undefined,
      onSale: query.onSale ? "true" : undefined,
    },
  });
}

/** URL for the listing; only non-default values are written so links stay readable. */
export function listingHref(query: ListingQuery): string {
  const params = filterParams(query);
  if (query.q) params.set("q", query.q);
  const sort = sortParamValue(query.sort);
  if (sort) params.set("sort", sort);
  if (query.view && query.view !== "grid") params.set("view", query.view);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `/products?${search}` : "/products";
}
