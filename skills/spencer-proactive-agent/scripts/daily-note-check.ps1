# Daily-Note-Check.ps1 — Kronos
# Checks if daily note exists; if missing, sends gentle reminder

$workspace = "C:\Users\spenc\.openclaw\workspace-atlas"
$today = Get-Date -Format "yyyy-MM-dd"
$notePath = Join-Path $workspace "memory\$today.md"

if (-not (Test-Path $notePath)) {
    # Use notify_progress to send reminder (goes to Kronos channel)
    # In the future, could also route to Atlas
    powershell.exe -File "C:\Users\spenc\.openclaw\workspace-atlas\skills\spencer-proactive-agent\scripts\notify_progress.ps1" -Agent "kronos" -Message "Daily note not created yet." -Level warning -Detail "Don't forget to record your empire activities for $today."
    Write-Host "Reminder sent for missing daily note."
} else {
    Write-Host "Daily note present."
}