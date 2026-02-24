# NetworkHelper.ps1 — v2.0 Network Resilience
# Provides proxy-aware, retry-enabled HTTP requests and health checks

$script:Config = $null
$script:ProxySettings = @{
    Enabled = $false
    Http = ""
    Https = ""
    Bypass = ""
}

function Initialize-NetworkHelper {
    param([string]$Workspace = "C:\Users\spenc\.openclaw\workspace")

    $configPath = Join-Path $Workspace "skills\spencer-proactive-agent\config\spencer-agent-v2.json"
    if (Test-Path $configPath) {
        $script:Config = Get-Content $configPath -Raw | ConvertFrom-Json
        if ($script:Config.network) {
            $script:ProxySettings.Enabled = $script:Config.network.proxy.enabled
            $script:ProxySettings.Http = $script:Config.network.proxy.http
            $script:ProxySettings.Https = $script:Config.network.proxy.https
            $script:ProxySettings.Bypass = $script:Config.network.proxy.bypass
        }
    }
}

function Get-ProxyParams {
    # Returns a hashtable suitable for Invoke-RestMethod -Proxy parameters
    if (-not $script:ProxySettings.Enabled) { return $null }

    $proxy = @{
        Proxy = $script:ProxySettings.Https
        Bypass = $script:ProxySettings.Bypass -split ';'
    }
    return $proxy
}

function Invoke-WithRetry {
    param(
        [scriptblock]$Command,
        [int]$MaxAttempts = 3,
        [int]$BackoffMs = 1000,
        [int]$MaxBackoffMs = 10000
    )

    $attempt = 0
    $currentDelay = $BackoffMs

    while ($attempt -lt $MaxAttempts) {
        try {
            $result = & $Command
            return $result
        } catch {
            $attempt++
            if ($attempt -eq $MaxAttempts) { throw }
            Write-Verbose "Request failed (attempt $attempt/$MaxAttempts): $_. Retrying in ${currentDelay}ms..."
            Start-Sleep -Milliseconds $currentDelay
            $currentDelay = [math]::Min($currentDelay * 2, $MaxBackoffMs)
        }
    }
}

function Test-NetworkHealth {
    param([string]$Workspace = "C:\Users\spenc\.openclaw\workspace")

    if (-not $script:Config -or -not $script:Config.network.healthCheck.enabled) {
        return $true  # skip if not configured
    }

    $targets = $script:Config.network.healthCheck.targets
    $allOk = $true

    foreach ($target in $targets) {
        try {
            $proxy = Get-ProxyParams
            if ($proxy) {
                $resp = Invoke-WithRetry -Command { Invoke-RestMethod -Uri $target.url -UseBasicParsing -TimeoutSec 5 @proxy } -MaxAttempts 1
            } else {
                $resp = Invoke-WithRetry -Command { Invoke-RestMethod -Uri $target.url -UseBasicParsing -TimeoutSec 5 } -MaxAttempts 1
            }
            if ($resp.StatusCode -ne $target.expectedCode) {
                Write-Warning "Health check $($target.name) returned $($resp.StatusCode) (expected $target.expectedCode))"
                $allOk = $false
            }
        } catch {
            Write-Warning "Health check $($target.name) failed: $_"
            $allOk = $false
        }
    }

    return $allOk
}

# Auto-initialize
Initialize-NetworkHelper
