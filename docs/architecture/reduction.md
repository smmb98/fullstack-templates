# Reducing the template
Turn the full superset into a client deliverable: soft (flags) or hard (delete slices), plan first.
Read this when the human asks to shrink the template or strip demo-only layers.

## Two kinds
- Soft reduce: flip flags in `apps/shop/features.config.json`. Reversible; use for demos and
  for testing that a feature is truly independent.
- Hard reduce: delete slices, routes, cards, tests, endpoint schemas, mocks, nav items and
  orphan assets. Not reversible; do it on a branch.

## The dry run
```
./dev pnpm reduce:plan --keep a,b,c [--themes ink] [--no-lab] [--no-demo-controls]
```
It resolves `dependsOn`, then lists every folder, route, story, spec, card, endpoint,
schema, mock, flag, nav item and orphan asset that would go. It deletes nothing.

## Procedure
1. Run `reduce:plan` with the keep-list from the human.
2. Show the plan. Wait for explicit approval; never delete before it (`user-todo.md`).
3. Create a branch; delete exactly the listed items.
4. Update `features/registry.ts`, `features.config.json`, nav, home sections and links.
5. `./dev pnpm flows:gen`, then `./dev pnpm check` (knip must report no dead code).
6. `./dev e2e --grep` for each kept tag; snapshots may need human-approved updates.
7. If asked, remove demo-only layers (scenario middleware, `NEXT_PUBLIC_DEMO_MODE`,
   Theme Lab, Demo Controls) and keep one theme/scheme/font.
8. Report: kept, removed, diff size, anything needing human judgement.

## What "removed" must include
- Slice folder, route file, stories, unit tests, e2e spec, flow card.
- Endpoint registry entries and zod schemas used only by it; mock handlers and fixtures.
- Flag, registry import, nav entry, generated INDEX row, cross-feature links.
- Docs mentions that would now mislead (cards, status notes).

## Rules
- Keep `dependsOn` intact for kept features; the plan must include dependencies.
- A kept feature must still pass its tag and the state matrix after the cut.
- Never reduce on the original template branch; never push.
- Soft reduce is the default for demos; hard reduce only for client handoff (D19).
