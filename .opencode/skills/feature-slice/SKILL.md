---
name: feature-slice
description: Use when creating or modifying a feature in apps/shop. Step-by-step slice checklist keeping contract, mocks, meta, flag, stories, e2e spec and flow card in sync.
---
## Create or change a feature
1. Read docs/flows/INDEX.md, then only the relevant card (docs/flows/<id>.md).
2. Contract first: update packages/api-contract (schema + endpoint registry), then
   packages/mocks (handler, supported scenarios, fixtures).
3. apps/shop/src/features/<id>/: feature.meta.ts (id, flag, routes, endpoints, states,
   scenarios -> data-state, dependsOn, tag, nav), index.ts (public exports only), components,
   hooks, api.ts.
4. Flag in apps/shop/features.config.json; register the meta in features/registry.ts.
5. Route file under app/ stays thin and calls notFound() when the flag is off.
6. Components use AsyncRegion, tokens and packages/ui primitives. No other-feature
   internals; use index.ts and dependsOn.
7. Stories: one per declared state, named States/<State>.
8. E2E: apps/shop/e2e/<id>.spec.ts tagged @<id>: happy path, recovery, offline, keyboard,
   mobile, axe.
9. Update the card (<= 60 lines) from docs/flows/_template.md.
10. ./dev pnpm flows:gen, then ./dev pnpm check, then ./dev e2e --grep @<id>.
11. Update docs/manager/status.md and commit.

## Done when
All steps pass and the feature can be disabled by its flag alone without breaking
anything else.
