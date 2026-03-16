$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$stateDir = Join-Path $repoRoot ".codex-pids"
$logDir = Join-Path $stateDir "logs"
$pwshPath = "C:\Program Files\PowerShell\7\pwsh.exe"

New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

$targets = @(
  @{
    Name = "backend"
    WorkingDirectory = Join-Path $repoRoot "server"
    Port = 8080
    Log = Join-Path $logDir "backend.log"
  },
  @{
    Name = "frontend"
    WorkingDirectory = Join-Path $repoRoot "social"
    Port = 3000
    Log = Join-Path $logDir "frontend.log"
  }
)

foreach ($target in $targets) {
  $pidFile = Join-Path $stateDir "$($target.Name).pid"

  if (Test-Path $pidFile) {
    $existingPid = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($existingPid) {
      $running = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
      if ($running) {
        Write-Output "$($target.Name.ToUpper())_ALREADY_RUNNING=$existingPid"
        continue
      }
    }
  }

  if (Test-Path $target.Log) {
    Remove-Item $target.Log -Force -ErrorAction SilentlyContinue
  }

  $command = "Set-Location '$($target.WorkingDirectory)'; npm start *>> '$($target.Log)'"
  $process = Start-Process -FilePath $pwshPath -ArgumentList "-NoProfile", "-Command", $command -WindowStyle Hidden -PassThru
  Set-Content -Path $pidFile -Value $process.Id
  Write-Output "$($target.Name.ToUpper())_STARTED=$($process.Id)"
}

Start-Sleep -Seconds 12

foreach ($target in $targets) {
  $listening = [bool](netstat -ano | Select-String ":$($target.Port)\s")
  Write-Output "$($target.Name.ToUpper())_PORT_$($target.Port)=$listening"
}
