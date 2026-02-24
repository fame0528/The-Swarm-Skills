# Context-Compact.ps1 — Kronos
# Weekly cleanup: archive old logs, compress memory

$workspace = "C:\Users\spenc\.openclaw\workspace"
$logsDir = Join-Path $workspace "memory\logs"
$archiveDir = Join-Path $workspace "memory\logs-archive"
$cutoffDays = 7
$cutoff = (Get-Date).AddDays(-$cutoffDays)

# Create archive dir if needed
if (-not (Test-Path $archiveDir)) { New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null }

# Archive old log files
Get-ChildItem $logsDir -Filter *.log | Where-Object { $_.LastWriteTime -lt $cutoff } | ForEach-Object {
    $dest = Join-Path $archiveDir $_.Name
    Move-Item $_.FullName $dest -Force
    Write-Host "Archived: $($_.Name)"
}

# Optionally compress archived logs (zip) could be added later

Write-Host "Context compact complete."