# Testing
Unit, story, matrix, per-feature e2e, a11y and visual tests, run inside containers only.
Read this when adding a test, fixing a failure, or deciding what "done" requires.

## Unit (Vitest)
Cover schemas, filter/sort/URL-state logic, price and promo math, scenario engine
determinism and script core logic. Keep them fast and pure; no network, no DOM where
avoidable. A bug fix gets a regression test.

## Stories
Title `Features/<id>/<Component>`; names like `Ready`, `Loading`, `Empty NoResults`,
`Error Http`. One story per declared state, named `States/<State>`. Region stories set
`parameters.scenario`; decorators provide QueryClient, ThemeProvider and MSW (addon v3:
`mswLoader` from `msw-storybook-addon/csf3`, handlers from `parameters.msw`).

## Playwright
Projects: `desktop` (1280 wide) and `mobile` (375 wide, Chromium emulation).
Reporters: `list` + `json`. Helpers in `apps/shop/e2e/_harness/`:
`gotoWithScenario`, `expectState`, `goOffline`. axe via `@axe-core/playwright`.

- `states.matrix.spec.ts`: for every registry meta, every route x scenario, assert the
  primary region's `data-state` equals the meta expectation. This is the cheap
  "all states" guarantee; keep it green before per-feature work.
- Per-feature spec (tagged `@<id>`): happy path, recovery paths (retry works, clear
  filters works), offline (banner, saved data visible, mutations disabled, reconnect
  recovers), keyboard path, mobile viewport, axe on ready + empty + error.
- Visual snapshots only on key routes (home, listing, product, cart, checkout) x themes
  `ink`/`sand` x schemes x desktop/mobile, generated in the Linux container only.
  Updating snapshots needs a note in `status.md` and human approval (`user-todo.md`).
- Assert user-visible outcomes and `data-state`, not implementation details. Avoid fixed
  sleeps; wait on state or network.

## Running
- `./dev pnpm check` = typecheck + lint + unit + storybook:build + flows:check +
  contrast:check + knip. `storybook:build` is the only gate that compiles the story tree,
  so it catches broken story imports or addon APIs that `tsc` cannot see.
- `./dev e2e --grep @<topic>` runs only the tagged tests you touched.
- `./dev e2e --grep @storybook` opens every `Features/*` story in the running Storybook and
  fails on an empty root or a console error. A Storybook build proves the bundle compiles;
  this proves the story actually renders.
- `./dev pnpm e2e:summary` prints only failures (title, file:line, first error, scenario,
  artifact paths, max 40 lines). Read that, not the full report.
- Do not re-read passing specs or logs; trust the summary.

## Adding a feature's tests
1. Stories for every declared state.
2. Meta scenario -> data-state mappings (feeds the matrix automatically).
3. `e2e/<id>.spec.ts` tagged `@<id>` covering the list above.
4. Run `flows:gen`, `check`, then `e2e --grep @<id>`.

## Optional CI
`.github/workflows/ci.yml` may run the same Docker commands. Write it, never push or
deploy from this environment.
