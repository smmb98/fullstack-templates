import { productDetailEndpoint } from "@fullstack-templates/api-contract";
import { apiRequest } from "@/lib/api-client";

export const productDetailKeys = {
  all: ["product-detail"] as const,
  detail: (slug: string) => [...productDetailKeys.all, slug] as const,
};

export function productPath(slug: string): string {
  return `/products/${encodeURIComponent(slug)}`;
}

export function fetchProductDetail(slug: string) {
  return apiRequest(productDetailEndpoint, { query: { slug } });
}
