# State model
Every async region exposes a `data-state` and renders a designed state; no blank screens.
Read this when building any data-driven region, mutation or offline behaviour.

## AsyncRegion
`packages/ui` exports `AsyncRegion`. Props: a TanStack query result (or explicit state),
a layout-matched `skeleton`, `isEmpty(data)`, an `empty` config, optional error overrides,
and `children(data)`. It renders a wrapper with `data-state` and `data-testid`.
Skeletons must match final dimensions (no layout shift) and carry `aria-busy` while loading.

| data-state | When | What the user sees |
|---|---|---|
| loading | first fetch, no data | skeleton with final dimensions, `aria-busy` |
| refetching | data present, fetch running | data stays, subtle progress bar |
| ready | data present | the content |
| empty:first-use | nothing exists yet | explanation + primary action |
| empty:no-results | search/filter matched nothing | what was applied, "Clear filters", suggestions |
| empty:cleared | user removed everything | confirmation + undo if destructive |
| error:network | offline or unreachable | message, auto-retry on reconnect, manual retry |
| error:timeout | request too slow | "taking too long", retry |
| error:http | 5xx or unknown | "our side", retry, short error id |
| error:not-found | 404 | friendly page with navigation |
| error:unauthorized / error:forbidden | 401 / 403 | sign-in prompt with return URL / access message |
| error:rate-limited | 429 | countdown from `retryAfter`, then retry |
| error:parse | invalid payload | treated like http, dev-only detail |
| partial | some sub-resources failed | what worked, inline error + retry per section |

Empty variants are chosen by the feature (`empty` config + `isEmpty`), never guessed in
shared code. 422 validation is not a region state: show it inline per field.

## Mutations
Statuses `idle | pending | success | error`. Disable double submit while pending.
Cheap reversible actions are optimistic; roll back on failure with an inline error.
Destructive actions offer undo. Toasts use `role="status"` (polite) or `role="alert"`
(assertive). Never navigate away before the server confirms.

## Offline
A global `OfflineBanner` shows connection state. TanStack `onlineManager` is wired to real
browser events. Cached data stays visible, tagged "showing saved data". Mutations are
disabled with an explanation. On reconnect, refetch active queries and briefly show
"back online". Tests use Playwright `context.setOffline(true)`.

## Copy
All user-facing state copy lives in `packages/ui/src/copy/states.ts`: friendly, specific,
action-oriented. Components pass ids/overrides, never inline strings. Extend the copy file
when adding a state message; keep one tone across features.

## Verification
Each supported state gets a Storybook story named `States/<State>` and a `feature.meta`
scenario mapping; `states.matrix.spec.ts` asserts `data-state` for every route x scenario.
Run the feature tag plus axe on ready, empty and error before declaring done.
