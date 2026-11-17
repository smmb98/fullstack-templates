# catalog-listing: Catalog listing
## Purpose
Browse the full catalog, search by term and sort the results without losing the URL state.
## User flow
1. Open `/products` from the header, the home hero or the "New arrivals" link.
2. The page shows a search field, a sort select and a grid of products.
3. Typing a term and submitting reloads `/products?q=...&sort=...` (a plain GET form).
4. Empty results offer "Clear filters"; errors offer "Try again" (rate limits count down).
## UX rules
- The grid is wrapped in `AsyncRegion`; the region exposes `data-state` for every state.
- The search form works without JavaScript; the URL is the single source of truth for filters.
- Cards keep a 4/3 image box so loading and ready have the same height (no CLS).
- Every control is keyboard reachable with a visible focus ring and >= 44px targets.
## States and scenarios
| Scenario | Expected data-state | Notes |
|---|---|---|
| ok | ready | 12 products, total 12 |
| large | ready | total 512, first page of items |
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
- A product with no images keeps the 4/3 box and shows no broken image.
- Long titles and descriptions wrap; prices stay on one line.
- `slow` shows the skeleton first, then ready: never asserted as a steady state.
## Tests
Tag @catalog-listing; spec `apps/shop/e2e/catalog-listing.spec.ts`; stories
`apps/shop/src/features/catalog-listing/listing.stories.tsx` (one story per state).
## Dependencies
dependsOn: none.   Endpoints: products.list.   Flag: catalogListing.
## Reduction notes
Referenced by the header link, the home hero buttons and `layout.tsx` footer copy.
Removing the slice means deleting the flag, `/products`, the nav links and this card.
