import { productsListEndpoint } from "@fullstack-templates/api-contract";
import { executeMock } from "./engine";
import { productsListHandler } from "./handlers/products-list";

export const mockHandlers = {
  [productsListEndpoint.id]: productsListHandler,
} as const;

function toHeaders(request: Request): Record<string, string> {
  return Object.fromEntries(request.headers.entries());
}

export async function handleProductsList(request: Request): Promise<Response> {
  const result = await executeMock(productsListEndpoint, productsListHandler, {
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
