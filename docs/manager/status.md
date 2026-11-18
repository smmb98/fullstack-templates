# Status (<= 30 lines, rewritten at the end of every session)
Phase: 2 (shop features) - in progress    Last updated: 2026-11-18
## Done
- `product-detail` slice: `/products/[slug]` with breadcrumbs, gallery (thumbnails, per-image
  fallback), colour/size radios with real per-combination stock, quantity clamp, add to bag
  (localStorage `fullstack-templates-cart`), native `<details>` accordion, `Product` JSON-LD and
  a mobile sticky buy bar.
- Contract: `products.detail` (`GET /products/detail?slug=`) returning `productDetailSchema`
  (highlights, specs, care, variants, leadTime) plus `partial`. Mocks derive specs/care/stock
  splits from each product, with hand-written copy for five fixtures.
- Catalog cards link to detail pages while the flag is on (plain href, no cross-feature import).
- Fixed header search label to "Search products" so two search fields stay unambiguous.
## Gate evidence
- `./dev pnpm check` green: typecheck, lint, 65 unit tests (14 new), storybook build,
  flows:check (5 features), contrast (30 pairs), knip (config hints only).
- `./dev e2e --grep "@product-detail"` green: 17 passed, 1 skipped (sticky bar on desktop).
- Full feature sweep green: 118 passed, 2 skipped (`@catalog-*|@search|@product-detail|@storybook`).
## Next 3
1. `reviews`: list, filter by rating, helpful votes, write-a-review form.
2. `related-recent`: related products plus recently viewed.
3. `cart`: bag page reading the same `fullstack-templates-cart` lines, quick add on cards.
## Blockers
- None. Restart `app`/`storybook` after code changes (Turbopack ignores the Windows mount).
## Decisions this session
- Product detail is query-fed like every other region, so JSON-LD renders client-side; Phase 3
  SEO will move it server-side. A 404 state's "Try again" navigates to the collection.
- Variant stock is split evenly from product stock, remainder first: a low-stock product with
  many variants honestly shows some combinations as unavailable.
- The bag line shape lives in `product-detail/cart.ts`; the `cart` slice will read and extend it.
- Storybook's all-stories test now asserts a mounted child and has a 180s budget (35 stories).
