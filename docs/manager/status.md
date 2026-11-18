# Status (<= 30 lines, rewritten at the end of every session)
Phase: 2 (shop features) - in progress    Last updated: 2026-11-18
## Done
- `search` slice: header combobox (`role="combobox"`, `aria-activedescendant`) with a 250ms
  debounced `search.suggest`, arrow-key nav that wraps, Enter to open, Escape keeps focus,
  click rows, and a real GET fallback to `/products?q=`.
- Suggestions are products first (title prefix wins), then one category and one brand, all
  mapped onto the catalog URL contract (`?q=`, `?category=`, `?brand=`).
- Recent searches: localStorage, newest first, case-insensitive de-dupe, cap 5, clear button,
  survives reload; empty input shows them instead of a request.
- Popup mirrors region states on `data-testid="region-search"` (loading, ready,
  empty:no-results, error:http, error:rate-limited, error:network) with retry on failure.
## Gate evidence
- `./dev pnpm check` green: typecheck, lint, 51 unit tests (8 new search), storybook build,
  flows:check (4 features), contrast (30 pairs), knip (config hints only).
- `./dev e2e --grep "@search"` green: 14 passed (desktop + mobile).
- `./dev e2e --grep "@catalog-listing|@catalog-filters|@catalog-sort|@storybook"` green: 88 passed.
## Next 3
1. `product-detail`: gallery, variants, stock, add to cart, accordion, JSON-LD, sticky mobile bar.
2. `reviews`: list, filter by rating, helpful votes, write-a-review form.
3. `related-recent`: related products plus recently viewed.
## Blockers
- None. Restart `app`/`storybook` after code changes (Turbopack ignores the Windows mount).
## Decisions this session
- Suggestion responses echo their query and the client keys results by the normalized text, so a
  late response can never label the wrong query.
- Search submits a real GET form, so the header search works before hydration; the combobox is an
  enhancement on top of it.
- Products, categories and brands stay inside the existing catalog URL params instead of a new
  search route; `product-detail` will later point product hits at their own page.
