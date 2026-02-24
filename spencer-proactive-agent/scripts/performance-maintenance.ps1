# Performance Maintenance — v2.0 Phase 3
# Compresses old logs, cleans temp, maintains buffer archives

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [int]$RetentionDays = 30
)

$cutoff = (Get-Date).AddDays(-$RetentionDays)
$bytesSaved = 0

# 1. Compress old log files to .zip
$logDirs = @("memory/logs", "skills/spencer-proactive-agent/memory/logs")
foreach ($dir in $logDirs) {
    $fullDir = Join-Path $Workspace $dir
    if (Test-Path $fullDir) {
        $oldLogs = Get-ChildItem $fullDir -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoff }
        foreach ($log in $oldLogs) {
            $zipPath = $log.FullName + ".zip"
            Compress-Archive -Path $log.FullName -DestinationPath $zipPath -Force
            $sizeBefore = $log.Length
            $sizeAfter = (Get-Item $zipPath).Length
            $bytesSaved += ($sizeBefore - $sizeAfter)
            Remove-Item $log.FullName -Force
        }
    }
}

# 2. Clean temp folder
$tempDir = Join-Path $Workspace "temp"
if (Test-Path $tempDir) {
    Get-ChildItem $tempDir -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
}

# 3. Prune buffer archives older than 30 days
$bufferArchive = Join-Path $Workspace "memory/buffer-archive"
if (Test-Path $bufferArchive) {
    Get-ChildItem $bufferArchive -Filter "*.md" | Where-Object { $_.LastWriteTime -lt $cutoff } | Remove-Item -Force
}

# Report
$mbSaved = [math]::Round($bytesSaved / 1MB, 2)
Write-Host "Performance maintenance complete. Saved approximately $mbSaved MB."
