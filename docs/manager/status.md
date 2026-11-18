# Status (<= 30 lines, rewritten at the end of every session)
Phase: 2 (shop features) - in progress    Last updated: 2026-11-18
## Done
- `catalog-listing` grown: grid/list toggle (`?view=list`), URL-synced pagination (`?page=`),
  compare-at price on sale cards, anchor pager, filters reset the page, 512-item `large` mock.
- `catalog-sort` slice: native sort select (relevance, price asc/desc, newest, rating, best
  selling) in its own feature; URL sync via `?sort=`, reload persistence, sort + filter combined,
  invalid values ignored. `catalog-listing` depends on it.
- Contract: `Product.createdAt` added (ISO datetime) so "newest" is real; fixtures dated.
## Gate evidence
- `./dev pnpm check` green: typecheck, lint, 29 unit tests (incl. sort URL parsing), storybook
  build, flows:check (2 features), contrast (30 pairs), knip (config hints only).
- `./dev e2e --grep "@catalog-sort"` green: 12 passed (desktop + mobile).
- `./dev e2e --grep "@catalog-listing|@storybook"` green: 54 passed; listing unchanged by the
  sort extraction and both new Sort stories render.
## Next 3
1. `catalog-filters`: facet tree, price range, rating, stock/sale, color/material, chips, drawer.
2. `search`: header search with debounced autosuggest, keyboard nav, recent searches.
3. `product-detail`: gallery, variants, stock, add to cart, accordion, JSON-LD, sticky mobile bar.
## Blockers
- None. Restart `app`/`storybook` after code changes (Turbopack ignores the Windows mount).
## Decisions this session
- Pagination links are anchors with client handlers, so paging works without JavaScript.
- Flags are server-read; a control-only slice (catalog-sort) receives `showSort` from the route.
- Unit tests now include `apps/shop/src/**/*.test.ts` for feature URL logic.
