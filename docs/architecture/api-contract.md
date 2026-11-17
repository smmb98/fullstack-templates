# API contract and api client
Zod schemas and the endpoint registry define every request/response; the api client is the only data path.
Read this when adding or changing an endpoint, an error kind, or the OpenAPI output.

## Contract package
`packages/api-contract/src/endpoints.ts` holds the registry. Each entry:
```ts
{ id, method, path, query, body, response, scenarios }
```
`query`, `body` and `response` are zod schemas (optional where natural). Types come only
from `z.infer`; never hand-write a duplicate interface.

- `id` is dotted: `products.list`, `cart.price`, `orders.create`.
- `path` uses `:param` segments; `query` covers the rest.
- `scenarios` is the list of scenario names the endpoint supports (see scenarios.md).
- List endpoints use the envelope `{ items, page, pageSize, total, facets? }`.

## ApiError
```ts
type ApiErrorKind =
  | "network" | "timeout" | "http" | "validation" | "unauthorized" | "forbidden"
  | "not-found" | "rate-limited" | "parse";
```
Fields: `kind`, `status?`, `retryAfter?`, `fieldErrors?`, `requestId`, `message` (safe copy).
Map status to kind: 401 unauthorized, 403 forbidden, 404 not-found, 422 validation,
429 rate-limited, other non-2xx http. zod failure => parse. fetch `TypeError` => network.
Abort due to timeout => timeout.

## apiClient.request(endpoint, input)
1. Build the URL from `API_BASE_URL` (default same-origin `/api`).
2. Apply a 10s default timeout through `AbortController`.
3. Send JSON; include the demo scenario headers/cookie when in demo mode.
4. Validate the response with the endpoint's zod schema; invalid => `parse`.
5. Throw `ApiError` for every failure; callers never see raw fetch errors.

Retries: GET only, up to 2 retries with backoff, only for `network` and 5xx; each attempt
sets `x-attempt` (used by the `flaky` scenario). Mutations are never auto-retried.

## Rules
- No component calls `fetch` directly; only the api client.
- Server components may call the client for static shells/SEO only; interactive regions
  stay client components behind TanStack Query (D2).
- Query keys derive from endpoint id + input; mutations invalidate the affected keys.
- New endpoint = schema + registry + mock handler + scenarios + tests in one change.

## OpenAPI
`./dev pnpm contract:gen` writes `docs/contracts/shop.openapi.yaml` from the registry.
Never edit that file by hand. The future NestJS backend implements this contract (D15);
breaking changes need an ADR and a version note in `status.md`.
