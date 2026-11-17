# Design brief: Hearth & Grain
Brand, themes, typography, spacing and UX principles for demo #1 (Shop). Fictional store; human approves.
Read this when making any visual or copy decision, or when adding a theme, font or component style.

## Brand
- Name: **Hearth & Grain** (fictional home and lifestyle store; awaiting human approval).
- Tagline: objects for the everyday home.
- Voice: warm, plain-spoken, specific. Short sentences. No hype, no exclamation marks.
- Content: about 60 products, 8 top-level categories (Furniture, Lighting, Kitchen and
  Dining, Bedding, Decor, Outdoor, Storage, Gifts), a few subcategories, 12 brands.
- Copy is real-feeling everywhere; no lorem ipsum, no placeholder greetings.
- Currency and locale come from one config: USD / en-US default, PKR / en-PK available (D16).

## Themes
| Theme | Neutrals | Accent | Feel |
|---|---|---|---|
| ink | near-black, cool greys, white | saturated cobalt | editorial, precise |
| sand | ivory, oat, warm clay | terracotta | soft, tactile |
| forest | deep green, moss, bone | brass | grounded, premium |

One accent per theme; primary is reserved for the single main action on a screen.
All combinations must pass WCAG AA (enforced by `contrast:check`).

## Typography (open-licensed, via `next/font`)
| Axis | Display | Body |
|---|---|---|
| modern | Outfit | Inter |
| editorial | Fraunces | Source Sans 3 |
| friendly | Nunito | Open Sans |

Two families maximum per pairing. Display for headings and product names; body for UI and
prose. No third family, no decorative scripts.

## Scale
- Spacing base 4px (4, 8, 12, 16, 24, 32, 48, 64, 96).
- Radii 6 / 10 / 16; two shadow levels only.
- Motion 150-250ms, ease-out; no motion under `prefers-reduced-motion`.
- Body line length 60-75 characters; headings tight, body relaxed.

## UX principles
- One primary action per screen; the same job looks the same everywhere.
- System status is always visible (loading, saving, offline); never a blank screen.
- Progressive disclosure: advanced filters collapse, details expand on demand.
- Skeletons match final layout (CLS < 0.1); optimistic UI for cheap reversible actions.
- Empty states say why and offer the next action.
- Forms validate inline on blur, errors sit next to the field, typed data is never lost.
- Touch targets >= 44px; visible focus; full keyboard paths.

## Navigation
Header: logo, category menu (mega menu desktop, drawer mobile), search, wishlist, compare
count, account, cart. Breadcrumbs on catalog and product pages. Sticky add-to-cart on
mobile product pages. Footer: categories, help, about, newsletter.

## Avoid the generic AI look
No default purple gradients, no emoji icons, no template-feeling section stacks. Use lucide
icons, real copy, one coherent visual system, photography with consistent art direction.
Placeholder art is generated locally until the human supplies licensed photos (D14).
