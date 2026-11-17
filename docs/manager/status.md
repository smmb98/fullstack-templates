# Status (<= 30 lines, rewritten at the end of every session)
Phase: 1 (foundation) - complete, waiting for "go"    Last updated: 2026-11-17
## Done
- 4.5 foundation packages: config, api-contract, mocks, ui, shop shell, api route,
  flows:gen/flows:check, contrast:check (6 theme sets x 5 pairs pass WCAG AA).
- 4.6 harness: Storybook 10.6.5 with theme/scheme/font toolbar + MSW `parameters.scenario`;
  Playwright 1.64.1 desktop/mobile projects, `e2e/_harness`, JSON report, `e2e:summary`.
- 4.7 scripts: `reduce:plan`, `gen-placeholders` (12 SVGs), `contract:gen` (OpenAPI 3.1)
  plus unit tests for flows, contrast, e2e-report, reduce, placeholders, contract.
- 4.8 sandbox slice `catalog-listing`: meta (14 states, 12 scenarios), flag, `/products`
  route, story per state, flow card, 34 e2e assertions (matrix, search, clear filters,
  offline recovery, axe). `reduce:plan --keep catalog-listing` reports no removals.
## Gate evidence
- `./dev pnpm check` green: typecheck, lint, 26 tests, flows:check (1 feature),
  contrast:check (30 pairs), knip.
- `./dev e2e --grep "@catalog-listing"` green: 34 passed (desktop + mobile).
## Next 3
1. Human review of Phase 1 evidence; wait for "go".
2. Phase 2 grows `catalog-listing` into the real catalog (per roadmap).
3. Keep flow card, stories, matrix and flag in sync in the same change.
## Blockers
- None. Docker DNS failed once on an image pull; retry works.
## Decisions this session
- Pins all >= 14 days old (ADR-012); Playwright image and package both 1.64.1 (ADR-003).
- Storybook 10 viewport is built in, no addon (ADR-014); pnpm 12 build approvals in
  `pnpm-workspace.yaml` `allowBuilds` (ADR-013).
- Next 16 uses `apps/shop/src/proxy.ts` (not root `middleware.ts`) for the demo cookie.
- E2E uses `http://app.localhost:3000` plus Chromium host-resolver rule to avoid the
  HTTPS upgrade, because Chrome maps `*.localhost` to loopback.
