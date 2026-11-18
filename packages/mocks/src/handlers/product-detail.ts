import type { Product, ProductDetailResponse } from "@fullstack-templates/api-contract";
import { productDetailFor } from "../fixtures/product-details";
import { DEFAULT_LATENCY_MS, RATE_LIMIT_SECONDS, type MockHandler, type MockResult } from "../types";

function notFound(slug: string): MockResult {
  return {
    status: 404,
    body: { error: "not-found", message: `We could not find “${slug}”.` },
  };
}

function toResponse(product: Product, partial = false): ProductDetailResponse {
  return { product: productDetailFor(product), ...(partial ? { partial: true } : {}) };
}

/** `catalog` is the list the storefront is currently browsing, so detail links never dead-end. */
export function createProductDetailHandler(catalog: Product[]): MockHandler {
  return (ctx): MockResult => {
    const slug = String(ctx.query.slug ?? "");
    const product = catalog.find((item) => item.slug === slug);
    const okBody = () => toResponse(product as Product);

    switch (ctx.scenario) {
      case "empty":
      case "error-404":
        return notFound(slug);
      case "slow":
        return product
          ? { status: 200, body: okBody(), delayMs: ctx.latencyMs || DEFAULT_LATENCY_MS }
          : notFound(slug);
      case "error-500":
        return { status: 500, body: { error: "server-error", message: "Something went wrong." } };
      case "error-401":
        return { status: 401, body: { error: "unauthorized", message: "Sign in to continue." } };
      case "error-403":
        return { status: 403, body: { error: "forbidden", message: "You do not have access." } };
      case "error-422":
        return {
          status: 422,
          body: {
            error: "validation",
            message: "Check the highlighted fields.",
            fieldErrors: { slug: ["That is not a product we recognise."] },
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
          ? product
            ? { status: 200, body: okBody() }
            : notFound(slug)
          : { status: 503, body: { error: "server-error", message: "Temporary failure." } };
      case "partial":
        return product
          ? {
              status: 200,
              body: { product: { ...productDetailFor(product), images: [], specs: [] }, partial: true },
            }
          : notFound(slug);
      case "bad-json":
        return {
          status: 200,
          rawBody: '{"product":{"slug":"oak-dining-table",',
          headers: { "Content-Type": "application/json" },
        };
      default:
        return product ? { status: 200, body: okBody() } : notFound(slug);
    }
  };
}
