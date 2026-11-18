# Status (<= 30 lines, rewritten at the end of every session)
Phase: 2 (shop features) - in progress    Last updated: 2026-11-18
## Done
- Phase 1 closed on human "go".
- `catalog-listing` grown: grid/list toggle (`?view=list`), URL-synced pagination (`?page=`),
  compare-at price on sale cards, real anchor pager that works without JS, filters reset the
  page, large scenario now serves a deterministic 512-item catalog. Quick add waits for `cart`.
## Gate evidence
- `./dev pnpm check` green: typecheck, lint, 26 unit tests, storybook:build, flows:check,
  contrast:check (30 pairs), knip (config hints only).
- `./dev e2e --grep "@catalog-listing"` green: 50 passed (desktop + mobile), incl. pagination
  reload, filter page-reset, keyboard layout toggle, axe on ready + empty + error.
- `./dev e2e --grep "@storybook"` green: every `Features/*` story renders, placeholder story ok.
## Next 3
1. `catalog-sort`: dedicated sort slice, URL sync, persistence on reload, sort + filter combined.
2. `catalog-filters`: facet tree, price range, rating, stock/sale, color/material, chips, drawer.
3. `search`: header search with debounced autosuggest, keyboard nav, recent searches.
## Blockers
- None. Remember: restart `app`/`storybook` after code changes (Turbopack ignores the Windows
  bind mount watcher); a stopped app makes every e2e fail with ERR_NAME_NOT_RESOLVED.
## Decisions this session
- Pagination links are anchors with client-side handlers, so paging still works without JS.
- The `large` mock scenario serves 512 synthetic products (ids/titles suffixed) instead of
  repeating 12 items, so page 2 is provably different from page 1.
