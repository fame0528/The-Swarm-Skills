# batch-sync.ps1
$workspace = "C:\Users\spenc\.openclaw\workspace"
$scriptsDir = Join-Path $workspace "scripts"
$skillDir = Join-Path $workspace "skills\spencer-proactive-agent\scripts"

Write-Host "Starting Unified Sync Batch..."

# 1. Sync Memory
if (Test-Path (Join-Path $scriptsDir "Sync-Memory.ps1")) {
    & powershell -ExecutionPolicy Bypass -File (Join-Path $scriptsDir "Sync-Memory.ps1")
}

# 2. Auto-Obsidian Sync
if (Test-Path (Join-Path $skillDir "auto-obsidian-sync.ps1")) {
    & powershell -ExecutionPolicy Bypass -File (Join-Path $skillDir "auto-obsidian-sync.ps1")
}

Write-Host "Sync Batch Complete."
