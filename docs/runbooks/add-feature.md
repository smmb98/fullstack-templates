# Runbook: add or change a feature
End-to-end checklist for one feature slice, contract first.
Read this when starting feature work; load the `feature-slice` and `ui-state-contract` skills too.

1. Read `docs/flows/INDEX.md`, then only `docs/flows/<id>.md`.
2. Contract: add/change schema + registry entry in `packages/api-contract`; add mock handler,
   fixtures and supported scenarios in `packages/mocks`.
3. Slice: `apps/shop/src/features/<id>/` with `feature.meta.ts`, `index.ts`, components,
   hooks, `api.ts`.
4. Flag in `apps/shop/features.config.json`; register meta in `features/registry.ts`;
   add the thin route under `app/` (`notFound()` when the flag is off).
5. UI: AsyncRegion, tokens, `packages/ui` primitives; map every supported scenario to a
   `data-state` in the meta.
6. Stories: one per declared state, `States/<State>`, `parameters.scenario` for regions.
7. E2E: `apps/shop/e2e/<id>.spec.ts`, tagged `@<id>`: happy, recovery, offline, keyboard,
   mobile, axe on ready/empty/error.
8. Card: fill `docs/flows/_template.md`, <= 60 lines.
9. `./dev pnpm flows:gen`; `./dev pnpm check`; `./dev e2e --grep @<id>`.
10. Run gap-state-inventory and harden on the feature before saying done.
11. Update `docs/manager/status.md`, commit locally.
