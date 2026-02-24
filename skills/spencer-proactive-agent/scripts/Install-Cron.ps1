# Install-Cron.ps1 — Kronos
# Installs Phase 1 cron jobs from manifest

[CmdletBinding()]
param(
    [string]$ManifestPath = "C:\Users\spenc\.openclaw\workspace-atlas\skills\spencer-proactive-agent\cron-jobs.json",
    [switch]$DryRun
)

Write-Host "⏳ Kronos: Installing Phase 1 cron jobs..."

if (-not (Test-Path $ManifestPath)) {
    Write-Error "Manifest not found at $ManifestPath"
    exit 1
}

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

Write-Host "Found $($manifest.jobs.Count) jobs in manifest."

foreach ($job in $manifest.jobs) {
    Write-Host "  [$($job.id)] $($job.name) — $($job.schedule.kind) — $($job.payload.path)"
}

if ($DryRun) {
    Write-Host "Dry run complete. No changes made."
    exit 0
}

# Use openclaw cron import
Write-Host "`nImporting via openclaw CLI..."
$importArgs = "cron import --file `"$ManifestPath`""
& openclaw $importArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cron jobs imported successfully."
    Write-Host "`nVerify with: openclaw cron list"
} else {
    Write-Error "Cron import failed with exit code $LASTEXITCODE"
    exit 1
}