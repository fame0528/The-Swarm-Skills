# batch-maintenance.ps1
$workspace = "C:\Users\spenc\.openclaw\workspace"
$scriptsDir = Join-Path $workspace "scripts"
$skillDir = Join-Path $workspace "skills\spencer-proactive-agent\scripts"
$day = (Get-Date).DayOfWeek
$hour = (Get-Date).Hour

Write-Host "Starting Unified Maintenance Batch..."

# Morning Maintenance (runs at 3am or 9am depending on trigger)
if ($hour -eq 3) {
    # 1. Log Rotation
    if (Test-Path (Join-Path $skillDir "log-rotation.js")) {
        node (Join-Path $skillDir "log-rotation.js")
    }
    # 2. Skill Auto-Registration
    if (Test-Path (Join-Path $skillDir "skill-auto-register.ps1")) {
        & powershell -ExecutionPolicy Bypass -File (Join-Path $skillDir "skill-auto-register.ps1")
    }
}

if ($hour -eq 9) {
    # 3. Wiki Sync
    if (Test-Path (Join-Path $skillDir "wiki-sync.ps1")) {
        & powershell -ExecutionPolicy Bypass -File (Join-Path $skillDir "wiki-sync.ps1")
    }
    # 4. Empire Registry Update
    if (Test-Path (Join-Path $skillDir "empire-registry.ps1")) {
        & powershell -ExecutionPolicy Bypass -File (Join-Path $skillDir "empire-registry.ps1")
    }
}

# Weekly Maintenance (Sundays)
if ($day -eq "Sunday") {
    if ($hour -eq 3) {
        # Performance Maintenance
        if (Test-Path (Join-Path $skillDir "performance-maintenance.ps1")) {
            & powershell -ExecutionPolicy Bypass -File (Join-Path $skillDir "performance-maintenance.ps1")
        }
    }
    if ($hour -eq 6) {
        # Security Audit
        if (Test-Path (Join-Path $skillDir "security-audit.ps1")) {
            & powershell -ExecutionPolicy Bypass -File (Join-Path $skillDir "security-audit.ps1")
        }
    }
}

Write-Host "Maintenance Batch Complete."
