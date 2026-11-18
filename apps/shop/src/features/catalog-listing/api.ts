import type { ProductListResponse, ProductSort } from "@showcase/api-contract";
import { productsListEndpoint } from "@showcase/api-contract";
import { apiRequest } from "@/lib/api-client";

export interface ListingQuery {
  q?: string;
  sort?: ProductSort;
  category?: string;
  page?: number;
  pageSize?: number;
}

export const listingKeys = {
  all: ["catalog-listing"] as const,
  list: (query: ListingQuery) => [...listingKeys.all, "list", query] as const,
};

export function fetchProducts(query: ListingQuery): Promise<ProductListResponse> {
  return apiRequest(productsListEndpoint, {
    query: { page: 1, pageSize: 12, ...query },
  });
}

/** URL for the listing; only non-default values are written so links stay readable. */
export function listingHref(query: ListingQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.sort && query.sort !== "relevance") params.set("sort", query.sort);
  const search = params.toString();
  return search ? `/products?${search}` : "/products";
}

