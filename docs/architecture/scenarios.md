# Mock scenarios
The mock API can force every awkward state through a query parameter, cookie or Storybook parameter.
Read this when you need a specific UI state, add an endpoint, or debug why a scenario is ignored.

## Vocabulary
`ok, empty, slow, error-500, error-401, error-403, error-404, error-422, rate-limit,
flaky, partial, large, bad-json`

| Name | Behaviour |
|---|---|
| ok | normal deterministic payload |
| empty | valid payload with zero items |
| slow | 3000ms delay by default (`?latency=` overrides) |
| error-500 | server error |
| error-401 / 403 / 404 | auth, permission, missing resource |
| error-422 | validation error with `fieldErrors` |
| rate-limit | 429 with `retryAfter` |
| flaky | first attempt fails; `x-attempt >= 1` succeeds |
| partial | composite screens: one sub-resource fails |
| large | 500+ items or very long strings |
| bad-json | malformed payload (exercises `parse`) |

## Declaring support
Each endpoint lists its scenarios in the registry. An unsupported scenario in demo mode
returns 400 `{ "error": "unsupported-scenario", "supported": [...] }` so typos fail loudly.

## Selecting
- Global: `?scenario=error-500`
- Per endpoint: `?scenario=products.list:error-500,orders.create:error-422`
- Latency: `?latency=800` (ms)
- Reset: `?scenario=reset`
- In-app navigation uses the client util; it stores the value in the session cookie
  `demo_scenario`. Route handlers and server components read the cookie. The cookie is written
  by `apps/shop/src/proxy.ts` (Next 16's proxy file, formerly middleware).
- Storybook reads `parameters.scenario` for region stories.

## Handlers
Pure and deterministic: `(ctx) => { status, body, headers, delayMs }` with
`ctx = { scenario, latencyMs, query, body, headers }`. No randomness without a fixed seed.
The same handlers back the Next.js route handlers and the MSW adapter (D5).

## Demo mode
Scenarios are active only when `NEXT_PUBLIC_DEMO_MODE=true`; otherwise the cookie is ignored
and handlers behave as `ok`. The reduced client build sets it to `false` and removes the
scenario layer (D19).

## Offline is not a scenario
Use Playwright `context.setOffline(true)`. Demo Controls has a separate client-side
"Simulate offline" toggle that makes the api client throw `network`. Never add an
`offline` scenario name.

## Adding a scenario
1. Add the name to the shared union in `packages/api-contract`.
2. Implement it in the scenario engine and in each handler that supports it.
3. Declare it on the endpoint; map it to a `data-state` in affected `feature.meta.ts`.
4. Add a Storybook story and a matrix row; run the feature tag.
