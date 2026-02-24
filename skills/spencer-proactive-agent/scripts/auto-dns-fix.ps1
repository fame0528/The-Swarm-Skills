# Auto-DNS Repair — v2.0 Network Resilience
# Automatically detects and fixes DNS issues affecting OpenRouter

param(
    [string]$TestDomain = "api.openrouter.ai",
    [int]$MaxRetries = 3,
    [int]$RetryIntervalSec = 10
)

function Test-DNSResolution {
    param([string]$Domain)
    try {
        $result = Resolve-DnsName -Name $Domain -Type A -ErrorAction SilentlyContinue
        return $result -ne $null
    } catch {
        return $false
    }
}

function Set-GoogleDNS {
    # Change adapter DNS to Google DNS (requires admin)
    $adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
    foreach ($adapter in $adapters) {
        try {
            Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ServerAddresses @("8.8.8.8","8.8.4.4") -ErrorAction SilentlyContinue
            Write-Host "Set DNS to Google (8.8.8.8) on adapter: $($adapter.Name)"
        } catch {
            Write-Warning "Failed to set DNS on $($adapter.Name): $_"
        }
    }
}

Write-Host "Testing DNS resolution for $TestDomain..."
$dnsWorking = Test-DNSResolution -Domain $TestDomain

if ($dnsWorking) {
    Write-Host "DNS is working correctly for $TestDomain."
    exit 0
}

Write-Host "DNS resolution FAILED for $TestDomain."
Write-Host "Attempting automatic fix: switching to Google DNS..."

# Try multiple times in case adapter is busy
for ($i = 1; $i -le $MaxRetries; $i++) {
    Write-Host "Attempt $i of $MaxRetries..."
    Set-GoogleDNS
    Start-Sleep -Seconds $RetryIntervalSec
    if (Test-DNSResolution -Domain $TestDomain) {
        Write-Host "DNS fix successful! $TestDomain now resolves."
        # Flush cache again
        ipconfig /flushdns | Out-Null
        Write-Host "DNS cache flushed."
        exit 0
    }
}

Write-Warning "DNS fix did not resolve the issue after $MaxRetries attempts."
Write-Warning "You may need to manually change DNS or check your network."
exit 1
