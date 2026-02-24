# Encrypt Logs — v2.0 Stealth Security
# Encrypts sensitive log files using Windows EFS (per-user encryption)

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace"
)

$logDirs = @(
    "memory/logs",
    "skills/spencer-proactive-agent/memory/logs"
)

foreach ($relDir in $logDirs) {
    $fullDir = Join-Path $Workspace $relDir
    if (Test-Path $fullDir) {
        # Encrypt all .log files
        Get-ChildItem $fullDir -Filter "*.log" | ForEach-Object {
            # Use cipher.exe to encrypt
            $cmd = "cipher /e `"$($_.FullName)`""
            cmd /c $cmd | Out-Null
            Write-Verbose "Encrypted: $($_.Name)"
        }
    }
}

Write-Host "Log encryption complete."
