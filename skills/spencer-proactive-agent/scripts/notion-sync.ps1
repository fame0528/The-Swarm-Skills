# Notion Sync — v2.0 Ecosystem Integration
# Syncs Notion database to local file (one-way: Notion → workspace)

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$ConfigPath = "config/notion-sync.json"
)

$configFile = Join-Path $Workspace $ConfigPath
if (-not (Test-Path $configFile)) {
    Write-Error "Notion sync config not found: $ConfigPath"
    Write-Error "Create file with: { `"integrationToken`": `\"your_token\"`, `"databaseId`": `\"db_id\"` }"
    exit 1
}

$config = Get-Content $configFile -Raw | ConvertFrom-Json
$token = $config.integrationToken
$databaseId = $config.databaseId

$headers = @{
    Authorization = "Bearer $token"
    "Notion-Version" = "2022-06-28"
    "Content-Type" = "application/json"
}

$url = "https://api.notion.com/v1/databases/$databaseId/query"
$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body '{}'

if ($response) {
    $outDir = Join-Path $Workspace "memory\notion"
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    $outFile = Join-Path $outDir "notion-db.json"
    $response | ConvertTo-Json -Depth 10 | Set-Content -Path $outFile -Encoding UTF8
    Write-Host "Notion sync complete: $outFile"
} else {
    Write-Warning "No data from Notion API"
}
