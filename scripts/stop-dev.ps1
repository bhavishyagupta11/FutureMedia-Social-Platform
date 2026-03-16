$ErrorActionPreference = "SilentlyContinue"

$repoRoot = Split-Path -Parent $PSScriptRoot
$stateDir = Join-Path $repoRoot ".codex-pids"

foreach ($name in @("backend", "frontend")) {
  $pidFile = Join-Path $stateDir "$name.pid"
  if (-not (Test-Path $pidFile)) {
    continue
  }

  $pidValue = Get-Content $pidFile
  if ($pidValue) {
    Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
  }

  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  Write-Output "$($name.ToUpper())_STOPPED=$pidValue"
}
