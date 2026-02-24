# Context Overflow Watcher — v2.0 Emergency Measure
# Monitors SESSION-STATE.md size and forces compression if approaching dangerous levels

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [int]$WarningThreshold = 180000,  # 180KB - start warning
    [int]$CriticalThreshold = 220000, # 220KB - force compress
    [int]$MaxSizeBeforeKill = 300000  # 300KB - kill session (last resort)
)

$sessionFile = Join-Path $Workspace "SESSION-STATE.md"
$compressor = Join-Path $Workspace "skills\spencer-proactive-agent\scripts\Compress-Buffer.ps1"

if (-not (Test-Path $sessionFile)) {
    exit 0
}

$size = (Get-Item $sessionFile).Length

if ($size -ge $MaxSizeBeforeKill) {
    Write-Warning "CRITICAL: SESSION-STATE.md size $size bytes exceeds max ($MaxSizeBeforeKill). Forcing aggressive compression and session restart may be needed."
    # Force compress with very aggressive settings
    & powershell -File $compressor -Workspace $Workspace -ThresholdBytes 100000 -RetentionDays 7
    exit 1
}
elseif ($size -ge $CriticalThreshold) {
    Write-Warning "CRITICAL: SESSION-STATE.md size $size bytes >= $CriticalThreshold. Forcing compression now."
    & powershell -File $compressor -Workspace $Workspace -ThresholdBytes 120000 -RetentionDays 7
}
elseif ($size -ge $WarningThreshold) {
    Write-Host "WARNING: SESSION-STATE.md size $size bytes >= $WarningThreshold. Consider manual compression."
}
else {
    Write-Verbose "SESSION-STATE.md size $size bytes — healthy"
}
