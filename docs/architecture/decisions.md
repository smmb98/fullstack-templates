# Decisions and ADR log
The fixed architecture decisions (D1-D19) and every later deviation or dependency choice.
Read this when a rule seems arbitrary, before changing architecture, or before adding a dependency.

## Decisions (D1-D19, verbatim from the brief)
D1  Monorepo: pnpm workspaces + Turborepo. Root dir name `showcase`.
D2  Framework: Next.js (App Router), TypeScript strict, latest stable verified at setup.
    Reason: market demand. Keep data-driven regions as client components behind the
    api client; use server components for static shells and SEO metadata only.
D3  Styling: Tailwind CSS mapped to CSS variable design tokens. Primitives: Radix UI,
    components copied into `packages/ui` (shadcn-style). Icons: lucide. No emoji as icons.
D4  Data layer: TanStack Query over a typed api client. Contracts are zod schemas in
    `packages/api-contract`; types are inferred from zod. OpenAPI is generated from the
    zod schemas into `docs/contracts/` so the future NestJS backend implements the same contract.
D5  Mock API: framework-agnostic, scenario-aware handler functions in `packages/mocks`.
    Two adapters over the SAME handlers: (a) Next.js route handlers under `/api/*`
    (used by the app, Playwright, and Netlify demo hosting), (b) MSW handlers for
    Storybook. `API_BASE_URL` switches the api client to the real backend later.
D6  Scenario protocol: Part 5.2.
D7  State model: every async region renders through `AsyncRegion` and exposes
    `data-state`. Part 5.3.
D8  Theming: CSS variables switched by attributes on `<html>`: `data-theme`,
    `data-scheme`, `data-font`. Part 5.4.
D9  Feature slices: each feature is a self-contained folder with a `feature.meta.ts`,
    a flag, stories, an e2e spec and a flow card. Part 5.5.
D10 Generated index: `docs/flows/INDEX.md` is GENERATED from the feature metas by
    `pnpm flows:gen`. Never edit it by hand. A drift check enforces consistency.
D11 Testing: Vitest (unit), Storybook (one story per supported state), Playwright
    (e2e, state matrix, a11y via axe, visual snapshots on key screens). Part 5.6.
D12 Gates: `pnpm check` = typecheck + lint + unit + flows drift check + knip.
    `pnpm e2e` is separate and tag-filterable.
D13 Client state (cart, wishlist, compare, recently viewed): zustand with persist.
    The mock server is stateless and deterministic (seeded data, no random).
D14 Images: generate local placeholder art by script first (no network). A backlog
    item asks the human to swap in licensed photos later.
D15 Backend (NestJS) is deferred. When it comes, it is contract-first against `docs/contracts/`.
D16 Currency and locale come from one config (`apps/shop/src/config/locale.ts`),
    default USD / en-US, with PKR / en-PK available.
D17 Hosting target: Netlify. Because the mock API ships as Next route handlers, the
    demo needs no separate backend host and has no cold-start problem.
D18 Fonts: via `next/font`, three curated pairings only (Part 5.4).
D19 Final deliverable to clients is a REDUCED build: Theme Lab, Demo Controls,
    scenarios and unwanted features removed (Part 5.7).

## ADR log (deviations and dependency choices)
| # | Date | Decision | Why | Alternative considered |
|---|---|---|---|---|
| ADR-001 | 2026-11-17 | The repo root is the `showcase` directory itself; no nested `showcase/` folder. | The brief's tree is the repo root; nesting would duplicate paths and break `./dev` assumptions. | Create a nested folder inside the existing repo. |
| ADR-002 | 2026-11-17 | Pin Node 26.13.1, pnpm 12.21.0, corepack 0.36.0 in the dev image. | Current Node LTS; Node 26 no longer bundles corepack, so corepack is installed explicitly. | Node 24 LTS (older, still supported). |
| ADR-003 | 2026-11-17 | Playwright service uses `mcr.microsoft.com/playwright:v1.65.1-noble`; `@playwright/test` must stay 1.65.1. | Official image ships matching browsers; version skew breaks runs. | Install browsers at container start (slow, network). |
| ADR-004 | 2026-11-17 | `opencode.json` uses the current `permissions` array schema, not the brief's illustrative `permission` object. | Verified against the live OpenCode config schema at setup time. | Keep the old object shape (not accepted by current OpenCode). |
| ADR-005 | 2026-11-17 | Vendor `gap-state-inventory` from `mattjmdesign/design-engineering` (skill `state-coverage`), renamed. | The brief's `dengskills` URL is dead; same author, live repo. | Skip the skill (loses the state audit workflow). |
| ADR-006 | 2026-11-17 | Build `harden` from impeccable's `skill/reference/harden.md`. | No standalone folder exists in the repo. | Skip it, use only gap-state-inventory. |
| ADR-007 | 2026-11-17 | Install the playwright skill's core guides plus `docker-and-containers.md` only. | CI helpers assume hosted runners; pom/migration/qa/cli are out of scope. | Install the whole skill (unused context). |
| ADR-008 | 2026-11-17 | Install modern-web-guidance with its official CLI inside the container; keep `skills-lock.json`. | The skill is a curated retrieval index, not a hand-written SKILL.md. | Vendor files manually (loses provenance/updates). |
| ADR-009 | 2026-11-17 | Commit the root `pnpm-lock.yaml`. | pnpm 12 self-manages via the root lockfile; reproducible tool runs. | Ignore it (non-reproducible). |
| ADR-010 | 2026-11-17 | Pin the modern-web-guidance CLI to npm `1.0.1` in every snippet, run it only through `./dev` (never the host), and set `DISABLE_TELEMETRY=1` on the `tools` service. | Reproducible retrieval, Docker-only rule, no telemetry; the bundle was verified against npm 1.0.1. | Leave a floating tag and run `npx` directly on demand. |
| ADR-011 | 2026-11-17 | Accept `gap-state-inventory` as the `state-coverage` skill from `mattjmdesign/design-engineering`, renamed; human approved on 2026-11-17. | The brief's URL is dead; same author, live repo, same audit purpose. | Drop the skill and rely on `harden` only. |

## Adding a dependency
Before installing anything not listed in D1-D19, add one row here: what, why, and the
alternative considered. Then pin the exact version; prefer releases at least 14 days old.
