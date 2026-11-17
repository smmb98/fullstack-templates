# Theming and tokens
Themes, colour schemes and font pairings switch through attributes on `<html>`; components use semantic tokens only.
Read this when adding a colour, font, theme axis or anything visual; never hardcode a value.

## Semantic tokens
Declare these as CSS variables in `packages/ui` and map Tailwind to them (Tailwind reads
the variables only): `--bg --bg-subtle --surface --surface-raised --fg --fg-muted --border
--primary --primary-fg --accent --success --warning --danger --focus-ring
--radius-sm/md/lg --shadow-1/2 --font-sans --font-display --font-mono`, plus a spacing
scale and motion tokens. No literal hex/px/font names in components.

## Axes
- `data-theme` = `ink | sand | forest`
- `data-scheme` = `light | dark | system`, plus a resolved attribute (`data-scheme-resolved`)
- `data-font` = `modern | editorial | friendly`

`system` follows `prefers-color-scheme` and updates live. All three attributes live on
`<html>` so portals and overlays inherit them.

## Fonts
`next/font`, three curated open-licensed pairings, at most two families each (D18).
Families and roles are recorded in `docs/architecture/design-brief.md`.

## Persistence and no flash
Persist choices in `localStorage`. A tiny inline `<head>` script applies the attributes
before first paint; never wait for React. Honour `prefers-color-scheme` when the stored
scheme is `system` or absent. Invalid stored values fall back to defaults.

## Theme Lab and Storybook
Theme Lab (flag `themeLab`) switches the three axes live and shows the current values.
Storybook toolbar items `theme`, `scheme`, `font` set the same `<html>` attributes as the
app. Both must use one shared setter, not duplicate logic.

## Contrast gate
`./dev pnpm contrast:check` computes WCAG AA for key pairs (fg/bg, fg-muted/bg,
primary-fg/primary, fg/surface, focus ring vs bg) for all 3 themes x 2 schemes. It fails
`pnpm check` below AA. When adding a token or theme, add its pairs to the checker.

## Reduced build
`themes.enabled` in config keeps one theme/scheme/font and drops the rest (D19). Removal
must also drop the Theme Lab, the inline script branches and unused font imports.

## Rules
- One accent per theme; keep primary for the single main action.
- Focus ring must be visible on every surface; test it, do not assume.
- Motion 150-250ms; no motion under `prefers-reduced-motion`.
- Radii 6/10/16, two shadow levels, 4px spacing base (see design-brief).
