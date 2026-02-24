# Context Purge — Emergency Hard Reset
# Nukes SESSION-STATE.md to last N lines, discarding history. Use only in emergencies.

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [int]$KeepLines = 100,
    [switch]$Force
)

$sessionFile = Join-Path $Workspace "SESSION-STATE.md"
if (-not (Test-Path $sessionFile)) {
    Write-Host "No session file to purge."
    exit 0
}

$size = (Get-Item $sessionFile).Length
Write-Host "Current SESSION-STATE.md size: $size bytes"

if (-not $Force) {
    $confirm = Read-Host "Are you sure you want to purge context to last $KeepLines lines? (Y/N)"
    if ($confirm -notmatch '^[Yy]$') {
        Write-Host "Aborted."
        exit 0
    }
}

$lines = Get-Content $sessionFile
$total = $lines.Count
if ($total -le $KeepLines) {
    Write-Host "File already small ($total lines <= $KeepLines). No purge needed."
    exit 0
}

$keep = $lines | Select-Object -Last $KeepLines
$discarded = $total - $KeepLines

# Archive discarded lines if any
$archiveDir = Join-Path $Workspace "memory\buffer-archive\purge-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
if (-not (Test-Path $archiveDir)) { New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null }
$discardedLines = $lines | Select-Object -First $discarded
$discardedFile = Join-Path $archiveDir "discarded-$((Get-Date).ToString('yyyyMMdd-HHmmss')).log"
$discardedLines | Out-File -FilePath $discardedFile -Encoding UTF8

# Overwrite with kept lines
$keep | Out-File -FilePath $sessionFile -Encoding UTF8

$newSize = (Get-Item $sessionFile).Length
Write-Host "Purged $discarded lines. New size: $newSize bytes"
Write-Host "Archived discarded context to: $discardedFile"
Write-Host "Context purge complete."
