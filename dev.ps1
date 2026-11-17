#!/usr/bin/env pwsh
# Windows entry point for every command. Never install tools on the host.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$command = if ($args.Count -gt 0) { $args[0] } else { "" }
$rest = if ($args.Count -gt 1) { $args[1..($args.Count - 1)] } else { @() }

switch ($command) {
  "up" { docker compose up -d app storybook }
  "down" { docker compose down }
  "shell" { docker compose run --rm tools sh }
  "e2e" { docker compose run --rm --no-deps e2e pnpm --filter @showcase/shop e2e @rest }
  "" {
    Write-Error "usage: ./dev.ps1 <command> ...  (up | down | shell | e2e [args] | <any command inside tools>)"
    exit 2
  }
  default { docker compose run --rm tools $command @rest }
}
exit $LASTEXITCODE
