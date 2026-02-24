# Install all swarm skills to the current agent's workspace
$repoSkills = "$PSScriptRoot\..\skills"
$agentSkills = "$env:OPENCLAW_HOME\workspace-$env:AGENT_ID\skills"
if (-not $agentSkills) { $agentSkills = "$HOME\.openclaw\skills" }

Write-Host "Installing swarm skills from $repoSkills to $agentSkills" -ForegroundColor Cyan

$skills = Get-ChildItem -Path $repoSkills -Directory
foreach ($skill in $skills) {
    $dest = Join-Path $agentSkills $skill.Name
    Write-Host "Copying $($skill.Name)..." -ForegroundColor Yellow
    Copy-Item $skill.FullName $dest -Recurse -Force
}

Write-Host "`nAll skills copied. Run 'clawhub list' to verify." -ForegroundColor Green
