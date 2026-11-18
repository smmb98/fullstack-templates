# product-detail: Product detail
## Purpose
Let a visitor judge one piece properly — photos, price, which colour and size is left — and put
a real variant in the bag.
## User flow
1. Open a card title in the catalog (or any `/products/<slug>` URL).
2. Breadcrumbs go Home → Collection → top category → the piece.
3. The gallery shows the first photo; thumbnails swap it and keep the alt text accurate.
4. Colour and size are radio groups; unavailable combinations are disabled, never hidden.
5. Quantity clamps to the chosen variant's stock (and to 10 for the demo).
6. "Add to bag" writes the line to localStorage, confirms what was added and the new bag count.
   The sticky bar on small screens repeats the action with the current selection.
7. Details / Materials & care / Delivery & returns expand in place with native `<details>`.
8. A `Product` JSON-LD block carries name, sku, brand, image, rating and the offer.
## UX rules
- The page has one primary action; it is disabled, with "Out of stock", when nothing is buyable.
- Options show availability for the *other* selected axis, so a disabled option is a real fact.
- Picking an option keeps the other axis when that pair exists, otherwise moves to the nearest
  in-stock pair; the selection can never point at a missing variant.
- The bag message is `role="status"` and names the variant, so the action is confirmed to
  screen readers without a toast.
- Prices come from `formatMoney`; sale prices show the compare-at price struck through and the
  saving as a badge.
- Gallery thumbnails are buttons with `aria-current`; the main image keeps a descriptive alt.
## States and scenarios
| Scenario | Expected data-state | Notes |
|---|---|---|
| ok | ready | gallery, variants, bag, accordion, JSON-LD |
| partial | partial | photos and specs missing; banner explains |
| slow | loading | skeleton matches the two-column layout |
| empty / error-404 | error:not-found | "Try again" returns to the collection |
| error-500 | error:http | retry re-requests the same slug |
| rate-limit | error:rate-limited | shared retry countdown |
| bad-json | error:parse | contract failure never renders half a product |
| offline (simulated) | error:network | check-connection copy |
## Edge cases
- Out of stock: quantity and both add buttons disabled (`oak-dining-table`).
- Stock split across variants leaves some options disabled (`stoneware-serving-bowl`).
- A product with no sizes uses the synthetic "One size" and hides the size group.
- Missing photos fall back to "Image coming soon" per image, including broken files.
- A very long title wraps without pushing the buy box off screen (`teak-outdoor-bench`).
- A slug change remounts the view, so a selection never leaks between products.
## Tests
Tag @product-detail; spec `apps/shop/e2e/product-detail.spec.ts`; stories
`apps/shop/src/features/product-detail/product-detail.stories.tsx` (one per state plus
out of stock, missing photos, long title).
Covers catalog → detail, gallery swap, variant + quantity → localStorage, out of stock,
missing slug, accordion, JSON-LD, axe and the mobile sticky bar.
## Dependencies
dependsOn: none (plain links only).   Endpoints: products.detail.   Flag: productDetail.
## Reduction notes
The catalog links titles here only while the flag is on. The bag key
`fullstack-templates-cart` is owned by `cart.ts` in this slice; the `cart` slice reads it and
the same line shape. JSON-LD is rendered client-side because the region is query-fed; Phase 3
SEO moves it server-side.
