# Status (<= 30 lines, rewritten at the end of every session)
Phase: 0 (setup) - complete, waiting for "go"    Last updated: 2026-11-17
## Done
- Skeleton, Docker dev image + `./dev`/`dev.ps1`, toolchain pinned (Node 26.13.1, pnpm 12.21.0).
- OpenCode config verified; 4 third-party skills vendored and registered (skills-register.md).
- AGENTS.md, own skills (ui-state-contract, feature-slice, reduce-template), docs tree,
  architecture docs and runbooks written; all docs/INDEX.md paths exist.
- Housekeeping: modern-web-guidance pinned to 1.0.1 and run only via ./dev (ADR-010);
  gap-state-inventory substitution accepted by the human (ADR-011); roadmap and backlog updated.
## Next 3
1. (after "go") 4.5 foundation packages: config, api-contract, mocks, ui, shop shell.
2. 4.6 Storybook and Playwright harness.
3. 4.7 scripts, then 4.8 sandbox slice (`catalog-listing`).
## Blockers
- None. Docker Desktop exited twice earlier; start it if `docker info` fails.
## Decisions this session
- opencode.json uses the current `permissions` array schema; skills sourced from live repos
  (ADR-001..009 in docs/architecture/decisions.md).
- Store name proposed: Hearth & Grain; themes/fonts recorded in design-brief.md. Human approval
  is in user-todo.md.
## Notes for the next agent
- Phase 0 gate is green. Do not start Phase 1 until the human says "go".
- `flows:gen` does not exist yet; docs/flows/INDEX.md is a header-only placeholder.
