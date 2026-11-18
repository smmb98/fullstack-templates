import {
  type AnyEndpoint,
  productDetailEndpoint,
  productsListEndpoint,
  searchSuggestEndpoint,
} from "@fullstack-templates/api-contract";
import { http, HttpResponse } from "msw";
import { executeMock } from "./engine";
import { products } from "./fixtures/products";
import { createProductDetailHandler } from "./handlers/product-detail";
import { largeCatalog, productsListHandler } from "./handlers/products-list";
import { searchSuggestHandler } from "./handlers/search-suggest";
import type { MockHandler } from "./types";

const productDetailHandler = createProductDetailHandler([...products, ...largeCatalog]);

function toHeaders(request: Request): Record<string, string> {
  return Object.fromEntries(request.headers.entries());
}

export function createMswHandlers(scenario?: string) {
  const handle = async (endpoint: AnyEndpoint, handler: MockHandler, request: Request) => {
    const url = new URL(request.url);
    if (scenario && !url.searchParams.has("scenario")) url.searchParams.set("scenario", scenario);
    const result = await executeMock(endpoint, handler, {
      url: url.toString(),
      headers: toHeaders(request),
    });
    if (result.rawBody !== undefined) {
      return new HttpResponse(result.rawBody, { status: result.status, headers: result.headers });
    }
    return HttpResponse.json(result.body ?? null, { status: result.status, headers: result.headers });
  };

  return [
    http.get("*/api/products", ({ request }) => handle(productsListEndpoint, productsListHandler, request)),
    http.get("*/api/products/detail", ({ request }) =>
      handle(productDetailEndpoint, productDetailHandler, request),
    ),
    http.get("*/api/search/suggest", ({ request }) =>
      handle(searchSuggestEndpoint, searchSuggestHandler, request),
    ),
  ];
}
