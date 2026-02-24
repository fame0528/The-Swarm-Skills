# Wellness-Harmony.ps1 — Kronos
# Evening routine check (meds, teeth, journal)

$workspace = "C:\Users\spenc\.openclaw\workspace"
$today = Get-Date -Format "yyyy-MM-dd"
$routineLog = Join-Path $workspace "memory\routine.log"

# Simple check: if routine log doesn't have today's entry, remind
if (Test-Path $routineLog) {
    $hasToday = Get-Content $routineLog | Select-String $today
    if (-not $hasToday) {
        powershell.exe -File "C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\scripts\notify_progress.ps1" -Agent "kronos" -Message "Evening routine not logged." -Level info -Detail "Remember: meds, teeth, journal. Confirm completion to silence future reminders."
        Write-Host "Evening routine reminder sent."
    } else {
        Write-Host "Evening routine already logged."
    }
} else {
    # No log file exists; assume not done
    powershell.exe -File "C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent\scripts\notify_progress.ps1" -Agent "kronos" -Message "Start routine logging." -Level info -Detail "Create memory\routine.log to track daily meds/teeth/journals."
}