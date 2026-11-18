# catalog-listing: Catalog listing
## Purpose
Browse, search, filter, sort, switch grid/list and page through results with URL state intact.
## User flow
1. Open `/products` from the header, the home hero or the "New arrivals" link.
2. The page shows search, sort, layout toggle, a filter sidebar (drawer on mobile) and a grid
   or list of products.
3. Typing filters live after a short debounce and updates `?q=`; on a large result set the
   Search button stays visible and only submits on click/Enter.
4. The `catalog-filters` slice writes category, brand, price, rating, stock, sale, colour and
   material; sort writes `?sort=`; the layout toggle writes `?view=list` when not the default.
5. Pagination writes `?page=` and keeps search, filters, sort and view; changing any filter
   returns to page 1. Pager links are real anchors, so they work without JavaScript.
6. Empty results offer "Clear filters"; errors offer "Try again" (rate limits count down).
## UX rules
- The grid is wrapped in `AsyncRegion`; the region exposes `data-state` for every state.
- Search and paging use client navigation (`router.replace/push`), never a native GET page load.
  The plain form and pager anchors still submit/navigate without JavaScript.
- Previous results stay visible while the next query loads (no skeleton blink).
- Cards keep a 4/3 image box so loading and ready have the same height (no CLS).
- Missing or broken photos show a labelled placeholder, never a blank box.
- Price shows the compare-at price struck through when a sale badge is present.
- Every control is keyboard reachable with a visible focus ring and >= 44px targets.
## States and scenarios
| Scenario | Expected data-state | Notes |
|---|---|---|
| ok | ready | 12 products, total 12, one page |
| large | ready | 512 products, pager and Search button |
| flaky | ready | first request 503, retry succeeds |
| partial | partial | data shown with a "some sections" notice |
| empty + `q` | empty:no-results | "Clear filters" clears `q` and every filter |
| empty, no filters | empty:first-use | "Browse everything" |
| error-500 / error-422 | error:http | retry button |
| error-401 | error:unauthorized | sign-in copy |
| error-403 | error:forbidden | no-access copy |
| error-404 | error:not-found | back to collection |
| rate-limit | error:rate-limited | Retry-After countdown |
| bad-json | error:parse | contract mismatch copy |
| offline (simulated) | error:network | retry succeeds once online |
## Edge cases
- A product with no images keeps the 4/3 box and shows "Image coming soon".
- A photo that fails to load falls back to the same labelled placeholder.
- The empty grid owns the single "Clear filters" action; the sidebar only offers "Clear all"
  when something is applied, so the page never shows the same action twice in one view.
- Long titles and descriptions wrap; prices stay on one line.
- `slow` shows the skeleton first, then ready: never asserted as a steady state. Quick add to
  cart arrives with the `cart` slice (the card will then depend on `cart`).
## Tests
Tag @catalog-listing; spec `apps/shop/e2e/catalog-listing.spec.ts`; stories
`apps/shop/src/features/catalog-listing/listing.stories.tsx` (one story per state,
plus "missing image", "list view" and "large collection"). Covers live search without reload,
large-set submit, category filtering through the filter panel, URL-synced pagination, filter
reset, the layout toggle (keyboard) and persistence, a decoded vase photo, the placeholder,
offline recovery and axe on ready + empty + error.
## Dependencies
dependsOn: catalog-sort, catalog-filters.   Endpoints: products.list.   Flag: catalogListing.
## Reduction notes
Header link, home hero buttons and `layout.tsx` footer use this slice. Card titles link to
`/products/<slug>` while `product-detail` is on. Removing it removes the flag and the route.
