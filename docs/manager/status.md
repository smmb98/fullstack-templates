# Status (<= 30 lines, rewritten at the end of every session)
Phase: 1 (foundation) - complete, waiting for "go"    Last updated: 2026-11-18
## Done
- 4.5-4.8 foundation: config, api-contract, mocks, ui, shop shell, Storybook 10.6.5
  (theme/scheme/font + MSW), Playwright 1.64.1 desktop/mobile, reduce/placeholder/contract
  scripts, and the `catalog-listing` sandbox slice.
- UX fixes: vase uses `hand-thrown-vase.svg`; a missing or broken photo shows a labelled
  "Image coming soon" box; category chips filter via `?category=`; typing filters live
  (300ms debounce, `router.replace`, `keepPreviousData`) and the Search button appears only
  above 100 results; the empty grid owns the single "Clear filters" action.
- Storybook was broken since Phase 1 (msw addon v3 has no `initialize`/root `mswLoader`);
  now uses `mswLoader` from `csf3` + `parameters.msw`, verified rendering in a browser.
- Rename to `fullstack-templates` (ADR-015): root package, `@fullstack-templates/*` scope,
  docs, titles, storage keys. Folders, Docker project name and "Hearth & Grain" unchanged.
## Gate evidence
- `./dev pnpm check` green: typecheck, lint, 26 unit tests, storybook:build, flows:check,
  contrast:check (30 pairs), knip.
- `./dev e2e --grep "@catalog-listing"` green: 42 passed (desktop + mobile), including a
  decode check on the vase photo and the broken-image fallback.
## Next 3
1. Human review of Phase 1 evidence; wait for "go".
2. Phase 2 grows `catalog-listing` and adds `catalog-filters`/`catalog-sort` slices.
3. Decide whether the Docker project name (`showcase`) should follow the rename; it needs a
   fresh install because the named volumes change.
## Blockers
- None. Two dev-server gotchas: Turbopack does not watch the Windows bind mount (restart the
  app after code changes) and a stopped app makes every e2e fail with ERR_NAME_NOT_RESOLVED.
## Decisions this session
- `check` now builds Storybook; tsc alone cannot see a broken addon API (ADR-015, testing.md).
- Viewport-sized images in Storybook stay lazy; verify photos in the app, not the iframe.
