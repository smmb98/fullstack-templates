# search: Search
## Purpose
Find a product, category or brand from the header without leaving the page: debounced
autosuggest, keyboard selection and recent searches.
## User flow
1. Focus the header search and type at least two letters.
2. After 250ms the popup asks `search.suggest`; products come first, then one matching category
   and one brand.
3. Arrow keys move the active row (wrapping), Enter opens it, Escape closes the popup and keeps
   focus, clicking a row opens it.
4. A chosen row navigates inside the catalog URL contract: product → `?q=<title>`,
   category → `?category=`, brand → `?brand=`. A plain Enter searches `?q=<typed>`.
5. Every submitted or chosen search is stored locally; with an empty input the popup lists the
   five most recent searches, newest first, with "Clear recent searches".
6. The form is a real GET form to `/products`, so search works before JavaScript loads.
## UX rules
- The input is a `combobox` with `aria-expanded`, `aria-controls` and `aria-activedescendant`;
  rows are `option`s inside a labelled `listbox`.
- Focus never leaves the input: rows use `mousedown` preventDefault and are selected by
  Arrow keys plus Enter, so screen-reader and keyboard flow stay on the field.
- The popup mirrors the region vocabulary in `data-state` (loading, ready, empty:no-results,
  error:*) on `data-testid="region-search"`, but draws rows instead of AsyncRegion blocks.
- Results are keyed by the normalized query and each response echoes its query, so a stale
  response can never label the current text.
- Recent searches live in localStorage only: no account, no server write, private mode safe.
## States and scenarios
| Scenario | Expected data-state | Notes |
|---|---|---|
| typing / ok | loading → ready | one request per 250ms pause |
| empty | empty:no-results | "No matches … Press Enter to search anyway" |
| slow | loading | rows replaced by "Looking for …" |
| error-500 | error:http | message plus "Try again" |
| rate-limit | error:rate-limited | wait a moment copy |
| offline (simulated) | error:network | check connection copy |
## Edge cases
- One character shows no list; blank input falls back to recents (or closes).
- The query is whitespace-collapsed and capped at 80 characters.
- Duplicate recents are case-insensitively de-duplicated and capped at five.
- A blur closes the popup unless focus moved inside the form (submit button, rows).
- `bad-json` becomes a parse error and shows the generic error state.
## Tests
Tag @search; spec `apps/shop/e2e/search.spec.ts`; stories
`apps/shop/src/features/search/search.stories.tsx` (one per state plus "recent searches").
Covers keyboard selection, recent + clear, reload persistence, Escape focus, no matches,
error + retry and axe with the popup open.
## Dependencies
dependsOn: none.   Endpoints: search.suggest.   Flag: search.
## Reduction notes
Rendered by `apps/shop/src/app/layout.tsx` next to the main nav. Removing the slice removes the
header slot, the `/api/search/suggest` route, the endpoint and the recent-search key. The
catalog listing keeps its own in-page search, so the catalog still works without this slice.
