# batch-health.ps1
$workspace = "C:\Users\spenc\.openclaw\workspace"
$scriptsDir = Join-Path $workspace "scripts"
$skillDir = Join-Path $workspace "skills\spencer-proactive-agent\scripts"

Write-Host "Starting Unified Health & Metrics Batch..."

# 1. Empire Metrics
if (Test-Path (Join-Path $skillDir "empire-metrics.ps1")) {
    & powershell -ExecutionPolicy Bypass -File (Join-Path $skillDir "empire-metrics.ps1")
}

# 2. Generate Dashboard
if (Test-Path (Join-Path $skillDir "generate-dashboard.ps1")) {
    & powershell -ExecutionPolicy Bypass -File (Join-Path $skillDir "generate-dashboard.ps1")
}

# 3. Dashboard Monitor
if (Test-Path (Join-Path $scriptsDir "dashboard-monitor.js")) {
    node (Join-Path $scriptsDir "dashboard-monitor.js")
}

Write-Host "Health Batch Complete."
