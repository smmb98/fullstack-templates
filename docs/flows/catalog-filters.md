# catalog-filters: Catalog filters
## Purpose
Narrow the catalog by category, brand, price, rating, availability, colour and material, with
facet counts, removable chips and a mobile drawer, all reflected in the URL.
## User flow
1. Open `/products`; facets arrive with the listing payload.
2. Desktop: use the left sidebar. Mobile: press "Filters" to open a drawer, choose, then
   "Show results" (or Escape) to return to the grid.
3. Category is a two-level tree; brand, colour and material are multi-select; price has two
   number inputs plus two sliders and an explicit "Apply price" (Enter also applies); rating
   is 4+/3+/2+; stock and sale are checkboxes.
4. Every change writes the URL (`category`, `brand`, `color`, `material`, `minPrice`, `maxPrice`,
   `minRating`, `inStock`, `onSale`), returns to page 1 and keeps `q`, `sort` and `view`.
5. Applied chips above the results remove one filter each; "Clear all" resets filters and search.
## UX rules
- One filter panel component, rendered with distinct id prefixes for desktop and the drawer.
- The drawer is a native `<dialog>`: focus trap, Escape, backdrop and focus return come free.
- Checkboxes, sliders and number inputs are native controls with 44px targets and focus rings.
- The panel holds an optimistic draft: a click shows immediately while the URL commit is in
  flight, then the draft re-syncs from the committed URL (so back/forward stay truthful).
- Facet counts are visible text, e.g. "Decor (2)", so the accessible name matches what is seen.
- Price inputs take dollars, store cents; the range is rejected before it reaches the URL.
- Facet counts come from the mock payload; they describe the whole catalog, not the filtered set.
- Empty results keep the panel usable and offer "Clear filters" from the region's empty state.
## States and scenarios
This slice owns controls, not an async region, so it declares no region state. It drives the
listing's `ready` and `empty:no-results` states; loading shows the panel without facets.
## Edge cases
- Minimum above maximum: inline alert, Apply disabled, no request is made.
- Non-numeric or negative price input is treated as empty; facets absent render groups out.
- No matches: `empty:no-results` with filters preserved so chips can undo them.
- Many facets scroll inside their own list; the page itself does not grow unbounded.
- Rapid changes are safe: each change is a URL commit and the previous grid stays visible.
- Combining brand + category that cannot match is a valid request that returns zero items.
## Tests
Tag @catalog-filters; spec `apps/shop/e2e/catalog-filters.spec.ts`; stories
`apps/shop/src/features/catalog-filters/filters.stories.tsx` (default, applied, loading facets).
Covers brand multi-select, price range + reload, inverted range, stacked rating/stock/sale,
colour + material, chips and clear all, facet labels, no-results, mobile drawer focus/Escape,
keyboard apply and axe on the listing and the open drawer.
## Dependencies
dependsOn: none.   Endpoints: products.list.   Flag: catalogFilters.
## Reduction notes
`catalog-listing` depends on this slice: removing it means dropping the sidebar/drawer slots,
the chip row and the filter URL parameters. Removing catalog-listing first leaves it orphaned;
reduce them together.
