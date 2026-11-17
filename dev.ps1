#!/usr/bin/env pwsh
# Windows entry point for every command. Never install tools on the host.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Quote-Arg([string]$value) {
  if ($value -match '^[A-Za-z0-9_@%+=:,./-]+$') { return $value }
  return "'" + ($value -replace "'", "'\''") + "'"
}

function Join-Args([string[]]$items) {
  return (($items | ForEach-Object { Quote-Arg $_ }) -join ' ')
}

# Docker creates empty mount-point dirs inside the bind mount for named volumes.
# Remove them when empty so the host tree stays clean; never delete real files.
function Clean-MountPoints {
  # Never touch mount points while a long-running service uses them: deleting the host
  # directory out from under a mounted volume restarts or corrupts Next/Storybook.
  try {
    $running = @(docker compose ps --status running --services)
  } catch {
    $running = @()
  }
  if ($running -contains "app" -or $running -contains "storybook") { return }

  $targets = @(
    "node_modules",
    "apps/shop/node_modules",
    "packages/config/node_modules",
    "packages/api-contract/node_modules",
    "packages/mocks/node_modules",
    "packages/ui/node_modules",
    "apps/shop/.next"
  )
  foreach ($target in $targets) {
    $path = Join-Path $PSScriptRoot $target
    if (Test-Path $path) {
      $items = Get-ChildItem -Force $path -ErrorAction SilentlyContinue
      if (-not $items) { Remove-Item $path -Force -ErrorAction SilentlyContinue }
    }
  }
}

$command = if ($args.Count -gt 0) { [string]$args[0] } else { "" }
$rest = if ($args.Count -gt 1) { $args[1..($args.Count - 1)] | ForEach-Object { [string]$_ } } else { @() }

switch ($command) {
  "up" { docker compose up -d app storybook }
  "down" {
    docker compose down
    Clean-MountPoints
  }
  "shell" { docker compose run --rm tools sh }
  "e2e" {
    $cmdline = Join-Args (@("npx", "--no-install", "playwright", "test") + $rest)
    docker compose run --rm --no-deps e2e sh -lc $cmdline
    $status = $LASTEXITCODE
    Clean-MountPoints
    exit $status
  }
  "" {
    Write-Error "usage: ./dev.ps1 <command> ...  (up | down | shell | e2e [args] | <any command inside tools>)"
    exit 2
  }
  default {
    $cmdline = Join-Args (@($command) + $rest)
    docker compose run --rm tools sh -lc $cmdline
    $status = $LASTEXITCODE
    Clean-MountPoints
    exit $status
  }
}
exit $LASTEXITCODE
