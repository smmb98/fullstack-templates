import type {
  SearchSuggestQuery,
  SearchSuggestResponse,
  SearchSuggestion,
} from "@fullstack-templates/api-contract";
import { products } from "../fixtures/products";
import { DEFAULT_LATENCY_MS, RATE_LIMIT_SECONDS, type MockHandler, type MockResult } from "../types";

function matches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

/**
 * Products first (title starts-with wins), then one category and one brand so a broad
 * word never lets products hide the other kinds entirely.
 */
export function buildSuggestions(query: string, limit = 6): SearchSuggestResponse {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return { query: query.trim(), suggestions: [] };

  const categories = unique(products.map((product) => product.category)).filter((value) =>
    matches(value, needle),
  );
  const brands = unique(
    products.flatMap((product) => (product.brand ? [product.brand] : [])),
  ).filter((value) => matches(value, needle));

  const reserved: SearchSuggestion[] = [
    ...categories.slice(0, 1).map((value) => ({
      type: "category" as const,
      value,
      label: value,
      detail: "Category",
    })),
    ...brands.slice(0, 1).map((value) => ({
      type: "brand" as const,
      value,
      label: value,
      detail: "Brand",
    })),
  ].slice(0, Math.min(2, limit));

  const products2 = products
    .filter(
      (product) =>
        matches(product.title, needle) ||
        matches(product.category, needle) ||
        (product.brand ? matches(product.brand, needle) : false),
    )
    .map((product) => ({
      product,
      score: product.title.toLowerCase().startsWith(needle)
        ? 2
        : matches(product.title, needle)
          ? 1
          : 0,
    }))
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title));

  const productSlots = Math.max(0, limit - reserved.length);
  const productSuggestions: SearchSuggestion[] = products2
    .slice(0, productSlots)
    .map(({ product }) => ({
      type: "product",
      value: product.slug,
      label: product.title,
      detail: product.category,
    }));

  return {
    query: query.trim(),
    suggestions: [...productSuggestions, ...reserved].slice(0, limit),
  };
}

export const searchSuggestHandler: MockHandler = (ctx): MockResult => {
  const query = ctx.query as unknown as SearchSuggestQuery;
  const limit = query.limit ?? 6;
  const okBody = (): SearchSuggestResponse => buildSuggestions(query.q ?? "", limit);

  switch (ctx.scenario) {
    case "empty":
      return { status: 200, body: { query: query.q ?? "", suggestions: [] } };
    case "large":
      return { status: 200, body: buildSuggestions(query.q ?? "", 10) };
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
          fieldErrors: { q: ["Search needs at least one character."] },
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
    case "bad-json":
      return {
        status: 200,
        rawBody: '{"query":"oak","suggestions":[',
        headers: { "Content-Type": "application/json" },
      };
    default:
      return { status: 200, body: okBody() };
  }
};
