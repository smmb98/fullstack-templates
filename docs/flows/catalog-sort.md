# catalog-sort: Catalog sort
## Purpose
Choose how the catalog is ordered and keep that choice in the URL, so a shared or reloaded
link shows the same order.
## User flow
1. On `/products`, open the "Sort by" select next to search.
2. Pick relevance, price low to high, price high to low, newest, top rated or best selling.
3. The page updates the grid through client navigation and writes `?sort=` (relevance stays out).
4. The choice survives reload, back/forward and combining with `q`, `category` and `page`.
## UX rules
- The select is a native `<select>`: keyboard, mobile pickers and screen readers work by default.
- Changing sort resets pagination to page 1 and keeps search, category and layout.
- A sort change never clears other filters and never triggers a full page load.
- The control hides when the `catalogSort` flag is off; the listing then uses relevance order.
- One label ("Sort by"), one id, a visible focus ring and a 44px target.
## States and scenarios
This slice owns a control, not an async region, so it declares no region state. The listing's
states still cover loading/ready/empty/error; sort only shapes the `ready` payload.
## Edge cases
- Unknown or malformed `?sort=` values are ignored (relevance) instead of erroring.
- `sort=relevance` is never written to the URL.
- Sorting a 512-item `large` catalog works with pagination; page 2 keeps the sort.
- Sort + filter: only matching items are ordered; counts stay those of the filtered set.
- Rapid changes are safe: each change is a URL commit, and TanStack keeps previous data visible.
## Tests
Tag @catalog-sort; spec `apps/shop/e2e/catalog-sort.spec.ts`; stories
`apps/shop/src/features/catalog-sort/sort.stories.tsx`; unit tests in `sort.test.ts` for URL
parsing. Covers price/newest order, reload persistence, sort + category, invalid values,
keyboard selection and axe on a sorted listing.
## Dependencies
dependsOn: none.   Endpoints: products.list.   Flag: catalogSort.
## Reduction notes
`catalog-listing` depends on this slice: deleting it means removing the frame's sort slot,
the `sort` URL parameter and the select. Removing catalog-listing first leaves this slice
unreachable; reduce them together.
