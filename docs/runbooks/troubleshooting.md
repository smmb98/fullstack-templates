# Runbook: troubleshooting
First checks for the failures you will actually hit in this repo.
Read this when a command fails before reading source code or the full logs.

## Docker
- `docker info` fails: start Docker Desktop; wait until it reports a server version.
- `./dev` says no service: run from the repo root; check `docker compose config`.
- Slow or stale mounts on Windows/macOS: keep the repo in the WSL2 filesystem where possible.
- Empty `node_modules`/`.next` folders appear in the bind mount: wrappers remove them after
  `run`/`down`; if one remains, delete it (it is a volume mount point, not content).

## Windows shell
- `dev.ps1` blocked: `Set-ExecutionPolicy -Scope Process Bypass -Force` in that shell.
- Quoting problems: `dev.ps1` passes a single-quoted `sh -lc` string; do not wrap args again.
- CRLF noise: `.gitattributes` enforces LF; re-checkout the file if the editor converted it.

## pnpm and installs
- `pnpm -v` mismatch: the image pins pnpm via corepack; do not install pnpm on the host.
- Lockfile drift: run `./dev pnpm install --frozen-lockfile`; commit `pnpm-lock.yaml`.
- New dependency fails the gate: add the ADR row first, then pin an exact version.

## App and mocks
- Scenario ignored: check `NEXT_PUBLIC_DEMO_MODE=true`, the endpoint supports it, and the
  cookie `demo_scenario` (or `?scenario=`) is set; `reset` clears it.
- 400 `unsupported-scenario`: fix the name; the error lists supported values.
- Blank screen: inspect `data-state`; a missing AsyncRegion branch usually means a state
  with no story/config.

## Checks and tests
- `flows:check` fails: run `flows:gen`; verify meta/card/story/flag/route all exist.
- `contrast:check` fails: fix the token pair, not the checker.
- `knip` reports dead code: remove the export/file or wire it; do not silence it.
- E2E fails: read `./dev pnpm e2e:summary` only; artifacts are listed there.
- Playwright browser missing: the `e2e` image tag must match `@playwright/test` exactly.
