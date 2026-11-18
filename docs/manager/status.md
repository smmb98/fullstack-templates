# Status (<= 30 lines, rewritten at the end of every session)
Phase: 2 (shop features) - in progress    Last updated: 2026-11-18
## Done
- `catalog-filters` slice: facet sidebar (desktop) + native `<dialog>` drawer (mobile), two-level
  category tree, brand/colour/material multi-select, price inputs + sliders with `Apply price`,
  rating, stock/sale, removable chips; all in the URL and resetting page 1.
- Facets come from the contract (`facetsSchema`); mocks count categories, brands, colours with
  swatches, materials, ratings and the price bounds of the result set.
- `catalog-listing` depends on `catalog-filters`; the old category chips are gone, the empty
  state now clears search and every filter.
## Gate evidence
- `./dev pnpm check` green: typecheck, lint, 43 unit tests (14 new filter-state), storybook
  build, flows:check (3 features), contrast (30 pairs), knip (config hints only).
- `./dev e2e --grep "@catalog-filters"` green: 21 passed, 1 skipped by design (drawer on desktop).
- `./dev e2e --grep "@catalog-listing|@catalog-sort|@storybook"` green: 66 passed.
## Next 3
1. `search`: header search with debounced autosuggest, keyboard nav, recent searches.
2. `product-detail`: gallery, variants, stock, add to cart, accordion, JSON-LD, sticky mobile bar.
3. `reviews`: list, filter by rating, helpful votes, write-a-review form.
## Blockers
- None. Restart `app`/`storybook` after code changes (Turbopack ignores the Windows mount).
## Decisions this session
- Filter panel keeps an optimistic draft keyed by a filter signature, so controls never bounce
  back while the URL commit is in flight; the draft re-syncs from the committed URL.
- Price applies on Enter or "Apply price" only (no blur commit), so a half-typed range never
  reaches the URL.
- Facet counts are visible text ("Decor (2)") instead of aria-label overrides, which keeps the
  accessible name equal to what is on screen (axe label-content-name-mismatch).
