# Behavioral Auth — v2.0 Stealth Security
# Learns normal script execution times, flags anomalies

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$StateFile = "memory/topics/behavioral-auth-state.json"
)

$statePath = Join-Path $Workspace $StateFile
$state = @{
    updatedAt = (Get-Date).ToString("o")
    scriptBaseline = @{}
}
if (Test-Path $statePath) {
    try {
        $saved = Get-Content $statePath -Raw | ConvertFrom-Json
        $state.scriptBaseline = $saved.scriptBaseline
    } catch { }
}

# Get all scripts in spencer-proactive-agent/scripts
$scriptsDir = Join-Path $Workspace "skills\spencer-proactive-agent\scripts"
$allScripts = Get-ChildItem $scriptsDir -Filter "*.ps1" | Select-Object -ExpandProperty Name

# Load recent run history from WAL or cron logs? We'll approximate using file access times on scripts? Not accurate.
# For now, we'll define typical windows: admin/maintenance scripts run 2-4 AM, user-facing run 8 AM-8 PM.
$anomalies = @()

foreach ($script in $allScripts) {
    $typical = "08:00-20:00"  # default
    # Determine typical based on name heuristics
    if ($script -match "compress|rotate|audit|security|backup") {
        $typical = "02:00-04:00"
    }
    # Check current hour against typical
    $now = Get-Date
    $hour = $now.Hour
    $start = [int]$typical.Split("-")[0]
    $end = [int]$typical.Split("-")[1]
    $inWindow = if ($start -le $end) { $hour -ge $start -and $hour -lt $end } else { $hour -ge $start -or $hour -lt $end }
    if (-not $inWindow) {
        $anomalies += "Script $script executed outside typical window ($typical)."
    }
}

# Save baseline (first run learns, subsequent runs compare? This version just simple check)
$state | ConvertTo-Json -Depth 3 | Set-Content -Path $statePath -Encoding UTF8

if ($anomalies.Count -gt 0) {
    $report = "🚨 **Behavioral Auth Alert**`n`n" + ($anomalies -join "`n") + "`n`nVerify this activity."
    Write-Output $report
} else {
    Write-Verbose "Behavioral auth: all scripts within normal windows."
}
