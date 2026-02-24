# Discord Integration (Simple, PS2-compatible) — v2.0 with retry
# Spencer Proactive Agent — Sends alerts to #atlas

param(
    [Parameter(Mandatory = $true)]
    [string]$Message,
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("info", "warning", "success", "error")]
    [string]$Level = "info"
)

# Load network helper for retry logic
$helper = Join-Path $PSScriptRoot "NetworkHelper.ps1"
if (Test-Path $helper) { . $helper } else { Initialize-NetworkHelper }

# Spencer's home base channel ID (from OLYMPUS_INDEX)
$channelId = "1471955220194918645"

$emoji = "INFO"
if ($Level -eq "warning") { $emoji = "WARN" }
if ($Level -eq "success") { $emoji = "OK" }
if ($Level -eq "error") { $emoji = "ERR" }

$formattedMessage = "${emoji} Proactive Agent - ${Message}"

$openclawCmd = "C:\Users\spenc\AppData\Roaming\npm\openclaw.cmd"
$sendArgs = @("message", "send", "--channel", "discord", "-t", "channel:$channelId", "-m", $formattedMessage)

function Send-Discord {
    & $openclawCmd @sendArgs 2>&1
}

Write-Host "Sending to #atlas..."
try {
    # Use retry if network helper available and configured
    if ($script:Config -and $script:Config.network.retry.enabled) {
        $max = $script:Config.network.retry.maxAttempts
        $backoff = $script:Config.network.retry.backoffMs
        $maxBackoff = $script:Config.network.retry.maxBackoffMs
        Invoke-WithRetry -Command ${function:Send-Discord} -MaxAttempts $max -BackoffMs $backoff -MaxBackoffMs $maxBackoff | Out-Null
    } else {
        Send-Discord | Out-Null
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Notification delivered"
    } else {
        Write-Warning "Failed to send (exit $LASTEXITCODE)"
    }
}
catch {
    Write-Warning "Send error: $_"
}
