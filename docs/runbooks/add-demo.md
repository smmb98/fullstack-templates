# Runbook: add a demo site
A new demo is a new app in the monorepo, reusing contract, mocks, UI and tooling.
Read this only after the human says go for a new demo; never start one on your own.

1. Get the human's go and a short brief (category, brand, features, states).
2. Add `apps/<demo>` (Next.js App Router) using `@showcase/config` presets and `@showcase/ui`.
3. Namespace its contract endpoints (e.g. `booking.services.list`) in `packages/api-contract`;
   add mock data/handlers and scenario support in `packages/mocks`.
4. Add `features.config.json`, `features/registry.ts`, providers, demo middleware and the
   locale config (copy the shop pattern; do not import shop internals).
5. Build features as slices; one card per feature under `docs/flows/`; keep the same
   meta/flag/story/spec/card discipline.
6. Write `docs/architecture/design-brief-<demo>.md` with brand, themes, fonts, principles.
7. Storybook: add the new app's stories; Playwright: add a project/route scope and tags.
8. `./dev pnpm flows:gen`, `./dev pnpm check`, `./dev e2e --grep @<tag>`.
9. Update `docs/manager/status.md`, `roadmap.md`, `backlog.md`; commit locally.
10. Note the Netlify target in the roadmap; do not deploy.
