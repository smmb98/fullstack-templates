import { productsListEndpoint, searchSuggestEndpoint } from "@fullstack-templates/api-contract";
import { http, HttpResponse } from "msw";
import { executeMock } from "./engine";
import { productsListHandler } from "./handlers/products-list";
import { searchSuggestHandler } from "./handlers/search-suggest";

function toHeaders(request: Request): Record<string, string> {
  return Object.fromEntries(request.headers.entries());
}

function withScenario(url: URL, scenario?: string): URL {
  if (scenario && !url.searchParams.has("scenario")) url.searchParams.set("scenario", scenario);
  return url;
}

export function createMswHandlers(scenario?: string) {
  return [
    http.get("*/api/products", async ({ request }) => {
      const url = withScenario(new URL(request.url), scenario);
      const result = await executeMock(productsListEndpoint, productsListHandler, {
        url: url.toString(),
        headers: toHeaders(request),
      });
      const headers = result.headers;
      if (result.rawBody !== undefined) {
        return new HttpResponse(result.rawBody, { status: result.status, headers });
      }
      return HttpResponse.json(result.body ?? null, { status: result.status, headers });
    }),
    http.get("*/api/search/suggest", async ({ request }) => {
      const url = withScenario(new URL(request.url), scenario);
      const result = await executeMock(searchSuggestEndpoint, searchSuggestHandler, {
        url: url.toString(),
        headers: toHeaders(request),
      });
      const headers = result.headers;
      if (result.rawBody !== undefined) {
        return new HttpResponse(result.rawBody, { status: result.status, headers });
      }
      return HttpResponse.json(result.body ?? null, { status: result.status, headers });
    }),
  ];
}
