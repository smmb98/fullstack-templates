---
name: reduce-template
description: Use when the human wants to shrink the template to a client's feature set. Dry-run plan, approval, hard deletion, regeneration and verification.
---
## Inputs
A keep-list of feature ids, which themes/schemes/fonts to keep, and whether to strip
demo-only layers (scenarios and DEMO_MODE, Theme Lab, Demo Controls).

## Procedure
1. ./dev pnpm reduce:plan --keep <ids> [--themes <t>] [--no-lab] [--no-demo-controls]
   (dry run: resolves dependsOn, lists everything that would be removed).
2. Show the plan to the human. Do NOT delete before approval.
3. Delete the listed slices, routes, stories, specs, cards, endpoints, schemas, mocks,
   flags, nav items and orphan assets. Update registry and features.config.json.
4. ./dev pnpm flows:gen, then ./dev pnpm check (knip must report no dead code).
5. ./dev e2e --grep for each kept tag. Visual snapshots may need human-approved updates.
6. If requested, remove demo-only layers and set NEXT_PUBLIC_DEMO_MODE=false.
7. Report: kept, removed, size of diff, anything that needs human judgement.

## Rules
Work on a new branch. Never touch the original template branch. Soft reduce (flags off)
is reversible; hard reduce is not, so only do it on the branch.
