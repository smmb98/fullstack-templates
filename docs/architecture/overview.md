# Overview and repo layout
Portfolio monorepo of demo sites; demo #1 is Shop, a Next.js "power template" with a mock API.
Read this when you are new to the repo, need the folder layout, or wonder why a rule exists.

## What this repo is
A set of quick-to-show demo websites, each a superset template for a business category
(shop first, then appointment booking, food, dashboard, portfolio hub). A future NestJS
backend replaces the mock API; frontends deploy to Netlify.

## What matters
- Attractive, instinctively usable, rich in real features.
- Every screen handles every state: loading, empty variants, error variants, offline,
  partial failure, validation, unauthorized, rate-limited, slow, content overflow.
- A template is a SUPERSET; any client build is a reduction. Every feature is a
  self-contained slice, so removal is mechanical and reviewable.
- Live demos switch theme/scheme/font and force states through Demo Controls.
- Agents work with minimal context: AGENTS.md, status, one flow card.

## Hard constraints
- Docker only: every command runs through `./dev`; nothing is installed on the host.
- Work inside the repo; fake data only; no secrets, deploys, pushes or real payments.
- No analytics, tracking or third-party runtime scripts.
- TypeScript strict; no `any` without a comment; tokens only; data only through the api
  client; no `console.log` left behind.
- WCAG AA in every theme x scheme; keyboard paths; reduced motion; 44px touch targets.
- Performance targets on key pages: LCP < 2.5s, CLS < 0.1, INP < 200ms (measured Phase 3).
- New dependency = one-line ADR first; pin exact versions.

## Repo layout
```
fullstack-templates/          repo root (this directory)
  AGENTS.md  opencode.json    agent entry point and config
  dev  dev.ps1                command wrappers (POSIX / Windows)
  docker-compose.yml  docker/Dockerfile.dev
  package.json  pnpm-workspace.yaml  turbo.json  tsconfig.base.json
  .opencode/skills/           vetted skills (see manager/skills-register.md)
  docs/                       INDEX, architecture, flows, manager, runbooks, contracts
  scripts/                    flows-gen, flows-check, reduce-plan, contrast-check,
                              e2e-summary, gen-placeholders
  apps/shop/                  Next.js app, e2e/, .storybook/
  packages/config             tsconfig, ESLint, Prettier, knip presets
  packages/api-contract       zod schemas + endpoint registry (types via z.infer)
  packages/mocks              scenario engine, fixtures, Next + MSW adapters
  packages/ui                 tokens, Tailwind preset, primitives, AsyncRegion
```

## How work flows
1. Contract first: `packages/api-contract`, then mocks, then UI.
2. UI reads data only through the api client + TanStack Query; regions use AsyncRegion.
3. A feature change updates meta, flag, card, stories and e2e spec in the same commit.
4. Run `./dev pnpm check` before saying done; run only the touched tag in e2e.

## Where to go next
- Decisions: `docs/architecture/decisions.md`
- Phase plan: `docs/manager/roadmap.md`; current work: `docs/manager/status.md`
- Commands and volumes: `docs/architecture/docker.md`
