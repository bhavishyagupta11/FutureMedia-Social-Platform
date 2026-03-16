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
  $staleListeners = netstat -ano | Select-String ":$($target.Port)\s+.*LISTENING"
  foreach ($listener in $staleListeners) {
    $parts = ($listener.ToString() -split "\s+") | Where-Object { $_ }
    $stalePid = $parts[-1]
    if ($stalePid -match "^\d+$") {
      Stop-Process -Id $stalePid -Force -ErrorAction SilentlyContinue
    }
  }
}

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

foreach ($target in $targets) {
  $url = "http://localhost:$($target.Port)"
  $healthy = $false
  for ($attempt = 0; $attempt -lt 10; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        $healthy = $true
        break
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  Write-Output "$($target.Name.ToUpper())_HTTP_OK=$healthy"
}
