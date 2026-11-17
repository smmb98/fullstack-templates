import type { ProductListQuery, ProductListResponse } from "@showcase/api-contract";
import { productFacets, products } from "../fixtures/products";
import { DEFAULT_LATENCY_MS, RATE_LIMIT_SECONDS, type MockHandler, type MockResult } from "../types";

function applyQuery(items: typeof products, query: ProductListQuery) {
  let result = items;
  if (query.q) {
    const needle = query.q.toLowerCase();
    result = result.filter(
      (product) =>
        product.title.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle) ||
        (product.brand ?? "").toLowerCase().includes(needle),
    );
  }
  if (query.category) result = result.filter((product) => product.category === query.category);
  if (query.brand) result = result.filter((product) => product.brand === query.brand);

  switch (query.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "rating":
      result = [...result].sort((a, b) => b.rating - a.rating);
      break;
    case "best-selling":
      result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      break;
  }
  return result;
}

export const productsListHandler: MockHandler = (ctx): MockResult => {
  const query = ctx.query as unknown as ProductListQuery;
  const filtered = applyQuery(products, query);
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  const okBody = (overrides: Partial<ProductListResponse> = {}): ProductListResponse => ({
    items,
    page,
    pageSize,
    total: filtered.length,
    facets: productFacets(products),
    ...overrides,
  });

  switch (ctx.scenario) {
    case "empty":
      return {
        status: 200,
        body: okBody({ items: [], total: 0 }),
      };
    case "slow":
      return { status: 200, body: okBody(), delayMs: ctx.latencyMs || DEFAULT_LATENCY_MS };
    case "error-500":
      return { status: 500, body: { error: "server-error", message: "Something went wrong." } };
    case "error-401":
      return { status: 401, body: { error: "unauthorized", message: "Sign in to continue." } };
    case "error-403":
      return { status: 403, body: { error: "forbidden", message: "You do not have access." } };
    case "error-404":
      return { status: 404, body: { error: "not-found", message: "Not found." } };
    case "error-422":
      return {
        status: 422,
        body: {
          error: "validation",
          message: "Check the highlighted fields.",
          fieldErrors: { page: ["Page must be a positive number."] },
        },
      };
    case "rate-limit":
      return {
        status: 429,
        body: { error: "rate-limited", message: "Too many requests." },
        headers: { "Retry-After": String(RATE_LIMIT_SECONDS) },
      };
    case "flaky":
      return Number(ctx.headers["x-attempt"] ?? "0") >= 1
        ? { status: 200, body: okBody() }
        : { status: 503, body: { error: "server-error", message: "Temporary failure." } };
    case "partial":
      return { status: 200, body: okBody({ partial: true }) };
    case "large":
      return {
        status: 200,
        body: okBody({ items: filtered.slice(0, Math.max(pageSize, 12)), total: 512 }),
      };
    case "bad-json":
      return {
        status: 200,
        rawBody: '{"items":[',
        headers: { "Content-Type": "application/json" },
      };
    default:
      return { status: 200, body: okBody() };
  }
};
