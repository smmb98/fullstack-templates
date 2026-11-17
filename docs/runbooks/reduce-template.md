# Runbook: reduce the template
Hard reduction is destructive; plan, approve, cut on a branch, verify.
Read this when the human wants a smaller build; load the `reduce-template` skill.

1. Collect the keep-list, themes/schemes/fonts to keep, and whether to strip demo layers.
2. Run `./dev pnpm reduce:plan --keep <ids> [--themes <t>] [--no-lab] [--no-demo-controls]`.
3. Show the plan to the human; wait for explicit approval.
4. Branch (`reduce/<client>`); never work on the template branch.
5. Delete exactly the listed slices, routes, stories, specs, cards, endpoints, schemas,
   mocks, flags, nav items and orphan assets; update registry and `features.config.json`.
6. Optionally remove scenario middleware, `DEMO_MODE`, Theme Lab, Demo Controls.
7. `./dev pnpm flows:gen`; `./dev pnpm check` (knip must be clean).
8. `./dev e2e --grep` for each kept tag; snapshots need human approval.
9. Report kept/removed/diff size and open judgement calls; update `status.md`.
