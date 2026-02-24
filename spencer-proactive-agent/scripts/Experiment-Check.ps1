# Experiment-Check.ps1 — Kronos
# Checks active experiments, updates status, notifies Prometheus

$workspace = "C:\Users\spenc\.openclaw\workspace"
$expDir = Join-Path $workspace "memory\experiments"

if (-not (Test-Path $expDir)) {
    # No experiments yet
    exit 0
}

$experiments = Get-ChildItem $expDir -Filter *.md
foreach ($exp in $experiments) {
    # Parse simple frontmatter? For now just log existence
    Write-Host "Found experiment: $($exp.Name)"
    # Could send notification to Prometheus channel via notify_progress
}

Write-Host "Experiment check complete."