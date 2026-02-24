# Network Health Check — v2.0
# Periodically tests external endpoints and reports status

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

# Load network helper
$helper = Join-Path $PSScriptRoot "NetworkHelper.ps1"
if (Test-Path $helper) { . $helper } else { Initialize-NetworkHelper }

$healthy = Test-NetworkHealth -Workspace $Workspace

if ($healthy) {
    Write-Verbose "All network endpoints healthy"
    exit 0
} else {
    Write-Warning "One or more network health checks failed"
    # Could send alert via discord if needed
    exit 1
}
