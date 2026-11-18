import {
  type AnyEndpoint,
  productDetailEndpoint,
  productsListEndpoint,
  searchSuggestEndpoint,
} from "@fullstack-templates/api-contract";
import { products } from "./fixtures/products";
import { executeMock } from "./engine";
import { createProductDetailHandler } from "./handlers/product-detail";
import { largeCatalog, productsListHandler } from "./handlers/products-list";
import { searchSuggestHandler } from "./handlers/search-suggest";
import type { MockHandler } from "./types";

/** Every product the storefront can link to, including the deterministic large catalog. */
const catalog = [...products, ...largeCatalog];
const productDetailHandler = createProductDetailHandler(catalog);

export const mockHandlers = {
  [productsListEndpoint.id]: productsListHandler,
  [productDetailEndpoint.id]: productDetailHandler,
  [searchSuggestEndpoint.id]: searchSuggestHandler,
} as const;

function toHeaders(request: Request): Record<string, string> {
  return Object.fromEntries(request.headers.entries());
}

async function respond(
  endpoint: AnyEndpoint,
  handler: MockHandler,
  request: Request,
): Promise<Response> {
  const result = await executeMock(endpoint, handler, {
    url: request.url,
    headers: toHeaders(request),
  });

  const headers = new Headers(result.headers);
  if (!headers.has("Content-Type") && !result.rawBody) {
    headers.set("Content-Type", "application/json");
  }

  if (result.rawBody !== undefined) {
    return new Response(result.rawBody, { status: result.status, headers });
  }
  return new Response(JSON.stringify(result.body ?? null), { status: result.status, headers });
}

export function handleProductsList(request: Request): Promise<Response> {
  return respond(productsListEndpoint, productsListHandler, request);
}

export function handleProductDetail(request: Request): Promise<Response> {
  return respond(productDetailEndpoint, productDetailHandler, request);
}

export function handleSearchSuggest(request: Request): Promise<Response> {
  return respond(searchSuggestEndpoint, searchSuggestHandler, request);
}
