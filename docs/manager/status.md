# Status (<= 30 lines, rewritten at the end of every session)
Phase: 1 (foundation) - in progress    Last updated: 2026-11-17
## Done
- 4.5 foundation packages: config, api-contract, mocks, ui, shop shell, api route,
  flows:gen/flows:check, contrast:check (6 theme sets x 5 pairs pass WCAG AA).
- 4.6 harness: Storybook 10.6.5 with theme/scheme/font toolbar + MSW `parameters.scenario`;
  Playwright 1.64.1 with desktop/mobile projects, `e2e/_harness` (scenario, state, offline,
  axe), JSON report and `e2e:summary` (verified against a fake failure).
- `./dev up` serves app (3000) and Storybook (6006, MSW worker 200); `./dev e2e --list` runs
  through the official Playwright image (no pnpm inside it).
## Next 3
1. 4.7 finish `reduce:plan`, `gen-placeholders`, `contract:gen` + unit tests for all scripts.
2. 4.8 sandbox slice `catalog-listing` (meta, flag, card, stories, matrix, offline, axe).
3. Then Phase 1 report and stop.
## Blockers
- None. Docker DNS failed once on an image pull; retry works.
## Decisions this session
- Pins all >= 14 days old (ADR-012); Playwright image and package both 1.64.1 (ADR-003).
- Storybook 10 viewport is built in, no addon (ADR-014); pnpm 12 build approvals in
  `pnpm-workspace.yaml` `allowBuilds` (ADR-013).
- Workspace packages export TS source; tsconfigs extend by relative path so Vite/oxc and
  Next resolve them without package-subpath lookups.
