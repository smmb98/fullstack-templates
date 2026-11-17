# Status (<= 30 lines, rewritten at the end of every session)
Phase: 1 (foundation) - in progress    Last updated: 2026-11-17
## Done
- 4.5 foundation packages: `@showcase/config` (ESLint 9 flat, prettier, tsconfigs, knip),
  `@showcase/api-contract` (zod schemas, ApiError, endpoint registry), `@showcase/mocks`
  (scenario engine, fixtures, Next + MSW adapters), `@showcase/ui` (tokens, Tailwind preset,
  primitives, AsyncRegion/Error/Empty, OfflineBanner, ThemeProvider, copy).
- `apps/shop` shell: layout with 6 next/font families, providers, api client, locale, demo
  middleware, `/api/products` mock route, empty feature registry + flags.
- `flows:gen` / `flows:check` / `contrast:check` implemented; INDEX header-only; 6 theme
  sets x 5 pairs pass WCAG AA. `./dev pnpm check` green.
## Next 3
1. 4.6 Storybook 10 + MSW addon, Playwright desktop/mobile projects, e2e-summary script.
2. 4.7 finish `reduce:plan`, `gen-placeholders`, `contract:gen` + unit tests.
3. 4.8 sandbox slice `catalog-listing` (meta, flag, card, stories, matrix, offline, axe).
## Blockers
- None.
## Decisions this session
- Foundation pins all >= 14 days old (ADR-012); pnpm 12 build approvals via
  `allowBuilds` in pnpm-workspace.yaml (ADR-013).
- Workspace packages export TS source and use relative tsconfig extends so Vite/oxc and
  Next resolve without package-subpath tsconfig lookups.
