# catalog-listing: Catalog listing
## Purpose
Browse the catalog, search, filter by category and sort without losing URL state or flashing
a full-page reload.
## User flow
1. Open `/products` from the header, the home hero or the "New arrivals" link.
2. The page shows search, sort, category chips and a grid of products.
3. Typing filters live after a short debounce and updates `?q=`; on a large result set the
   Search button stays visible and only submits on click/Enter.
4. Category chips toggle `?category=`; "Clear filters" removes `q` and `category`.
5. Empty results offer "Clear filters"; errors offer "Try again" (rate limits count down).
## UX rules
- The grid is wrapped in `AsyncRegion`; the region exposes `data-state` for every state.
- Search uses client navigation (`router.replace/push`), never a native GET page load.
  The plain form still submits without JavaScript.
- Previous results stay visible while the next query loads (no skeleton blink).
- Cards keep a 4/3 image box so loading and ready have the same height (no CLS).
- Missing or broken photos show a labelled placeholder, never a blank box.
- Every control is keyboard reachable with a visible focus ring and >= 44px targets.
## States and scenarios
| Scenario | Expected data-state | Notes |
|---|---|---|
| ok | ready | 12 products, total 12 |
| large | ready | total 512, Search button required |
| flaky | ready | first request 503, retry succeeds |
| partial | partial | data shown with a "some sections" notice |
| empty + `q` | empty:no-results | "Clear filters" clears `q` |
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
- The empty grid owns the "Clear filters" action: the form hides its copy while the grid is
  empty, so one control never carries the same name twice.
- Long titles and descriptions wrap; prices stay on one line.
- `slow` shows the skeleton first, then ready: never asserted as a steady state.
## Tests
Tag @catalog-listing; spec `apps/shop/e2e/catalog-listing.spec.ts`; stories
`apps/shop/src/features/catalog-listing/listing.stories.tsx` (one story per state,
plus "missing image"). Covers live search without reload, large-set submit, category chips,
a decoded vase photo (not just an image element), the placeholder fallback, offline recovery
and axe.
## Dependencies
dependsOn: none.   Endpoints: products.list.   Flag: catalogListing.
## Reduction notes
Referenced by the header link, the home hero buttons and `layout.tsx` footer copy.
Removing the slice means deleting the flag, `/products`, the nav links and this card.
