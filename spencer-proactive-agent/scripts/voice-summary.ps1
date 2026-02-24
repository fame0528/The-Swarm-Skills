# Voice Summary — v2.0 Ecosystem Integration
# Generates spoken morning summary using System.Speech

param(
    [string]$Workspace = "C:\Users\spenc\.openclaw\workspace",
    [string]$OutputFile = "memory/voice/morning-summary.mp3"
)

# Generate text summary from spencer-metrics and daily digest
$metricsFile = Join-Path $Workspace "memory/topics/spencer-metrics.md"
$digestFile = Join-Path $Workspace "memory/digests/$(Get-Date -Format 'yyyy-MM-dd')-morning.json"

$text = "Good morning, Spencer. Here's your daily summary.`n"

if (Test-Path $metricsFile) {
    $metrics = Get-Content $metricsFile -Raw
    if ($metrics -match "Deep Work Hours:\s*([\d.]+)") { $text += "Deep work yesterday: $($matches[1]) hours.`n" }
    if ($metrics -match "Daily Note Rate:\s*([\d.]+)%") { $text += "Daily logging rate: $($matches[1]) percent.`n" }
    if ($metrics -match "Buffer Compressions:\s*(\d+)") { $text += "Buffer compressions: $($matches[1]).`n" }
}

$text += "Check your dashboard for full details. Have a productive day!"

# Ensure output directory
$outPath = Join-Path $Workspace $OutputFile
$outDir = Split-Path $outPath -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

# Use System.Speech to synthesize to WAV then convert? We'll output WAV directly for simplicity
$wavPath = [IO.Path]::ChangeExtension($outPath, ".wav")
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile($wavPath)
$synth.Speak($text)
$synth.Dispose()

Write-Host "Voice summary generated: $wavPath"
