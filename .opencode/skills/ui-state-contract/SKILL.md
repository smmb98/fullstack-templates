---
name: ui-state-contract
description: Use when building, changing or reviewing any screen or feature that shows data. Defines required UI states, mock scenario names and how to verify them cheaply.
---
## Rule
Every data-driven region is wrapped in AsyncRegion and handles ALL states in
docs/architecture/state-model.md. Each supported state has a Storybook story and is
covered by the state matrix test. UI work is not done without them.

## States (data-state values)
loading, refetching, ready, empty:first-use, empty:no-results, empty:cleared, error:network,
error:timeout, error:http, error:not-found, error:unauthorized, error:forbidden,
error:rate-limited, error:parse, partial. Validation (422) is inline per field.
Also check: overflow (long text, 500 items, missing image) and mutation
pending/success/error with rollback.

## Scenarios (mock API)
Set with ?scenario=<name> or ?scenario=<endpoint.id>:<name>,... and ?latency=<ms>.
Names: ok, empty, slow, error-500, error-401, error-403, error-404, error-422, rate-limit,
flaky, partial, large, bad-json. Each endpoint declares which it supports.
Offline is NOT a scenario: use Playwright context.setOffline(true).

## Do
1. Declare scenarios -> expected data-state in the feature.meta.
2. Add stories named by state; set parameters.scenario for region stories.
3. Run only your tag: ./dev e2e --grep @<tag>; read ./dev pnpm e2e:summary.
4. Run the gap-state-inventory and harden skills on the feature before declaring done.
5. Theme x scheme checks only on key screens; contrast is enforced by contrast:check.

## Do not
Invent new state names, fetch outside the api client, hardcode copy (use
packages/ui/src/copy/states.ts), or re-read passing specs.
