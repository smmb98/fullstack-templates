# Docker and `./dev`

Every command runs in a container; the host has only Docker and git. `./dev <cmd>` is the
only entry point.
Read this when a command fails, you touch docker-compose/Dockerfile, or volumes confuse you.

## Toolchain (pinned)
- Base image `node:26.13.1-bookworm-slim` (current LTS; Node 26 no longer bundles corepack).
- Corepack 0.36.0 installed in the image, activating `pnpm@12.21.0` from `packageManager`.
- pnpm store: named volume `pnpm_store` mounted at `/pnpm-store`; `.npmrc` sets `store-dir`.

## Services
| Service | Purpose | Port |
|---|---|---|
| `tools` | one-off commands (`pnpm install`, `check`, scripts), idle container | - |
| `app` | Next.js dev server (`NEXT_PUBLIC_DEMO_MODE=true`) | 3000 |
| `storybook` | Storybook with MSW addon | 6006 |
| `e2e` | official Playwright image, reaches the app at `http://app.localhost:3000` | - |

Chrome maps every `*.localhost` name to loopback instead of asking Docker DNS, and it
upgrades plain-http single-label hosts to https. The app container therefore gets the alias
`app.localhost` and the e2e container passes
`PLAYWRIGHT_HOST_RESOLVER_RULES=MAP app.localhost app` so Chromium resolves the alias back to
the compose service inside the network. Do not use `http://app:3000` in Playwright.

All four share `image: showcase-dev` except `e2e`, whose image tag matches the pinned
`@playwright/test` minor version.

## Wrapper
- POSIX/macOS/WSL: `./dev up | down | shell | e2e [args] | <any command>`
- Windows PowerShell: `.\dev.ps1 ...` (same subcommands).
- Windows may block `.ps1` files. Use a process-scoped bypass, no host setting changes:
  `powershell -ExecutionPolicy Bypass -File .\dev.ps1 pnpm check`.
- Arguments are executed via `sh -lc 'exec "$@"' -- ...` so Compose never parses command
  flags such as `-v` or `--grep`.
- `./dev <cmd>` is `docker compose run --rm tools ...`; the `tools` service is not started
  by `./dev up` (services are listed explicitly).

## Volumes (host never gets node_modules)
Bind mount: repo root -> `/repo`. Named volumes overlay:
`/repo/node_modules`, each workspace's `node_modules`, `apps/shop/.next`, and the pnpm store.
Because the repo is bind-mounted, source edits are live. Because node_modules and `.next`
are volumes, they never appear on the host and survive container restarts. Docker still
creates the empty mount-point directories inside the bind mount; the wrappers remove them
when empty (after every `run`, and on `down`), never touching real files.

Do not run `pnpm install` on the host. If you ever see `node_modules` on the host, delete it
and report how it happened.

## Windows and macOS notes
- Bind mounts are slow on Windows/macOS. On Windows keep the repo inside the WSL2 filesystem
  for real projects; this portfolio repo runs from the Windows filesystem with polling
  (`WATCHPACK_POLLING=true`).
- Files written by the container are owned by uid 1000 (`node`). On Windows this is invisible;
  on Linux/macOS prefer a matching uid to avoid root-owned files in the bind mount.
- Line endings are LF (`core.autocrlf` off via `.gitattributes`). CRLF breaks `./dev`.

## Gates and troubleshooting
- `docker compose config --quiet` must pass after any compose edit.
- `./dev pnpm -v` prints 12.21.0.
- `docker compose build tools` rebuilds the image; do it after Dockerfile changes.
- If the daemon is down, start Docker Desktop and wait for `docker info` to succeed.
- If a volume holds stale dependencies after a lockfile change, `./dev pnpm install` is
  enough; only use `docker compose down -v` when you accept losing caches.
