# Spencer Proactive Agent v2.0 — User Guide

**Version:** 2.0.0-alpha  
**Last Updated:** 2026-02-20  
**Maintainer:** Atlas (OpenClaw Agent)

---

## Introduction

The Spencer Proactive Agent is your invisible co-pilot for empire-building. It reduces cognitive load by automating context management, flow-aware scheduling, documentation, and integrations.

This guide covers how to use v2.0 features in practice.

---

## Quick Start

1. **Initialize** (creates required folders):
   ```powershell
   cd C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent
   .\scripts\Initialize-v2.Upgrades.ps1
   ```

2. **Enable features** via `config/spencer-agent-v2.json` (all enabled by default).

3. **Install cron jobs** (if not auto-loaded):
   ```powershell
   .\scheduling\install-cron.ps1
   ```

4. **Let it run** — no daily interaction needed. Check `memory/logs/` for activity.

---

## Features Overview

### Invisible Assistant

- **Buffer Compression:** Automatically compresses `SESSION-STATE.md` when it exceeds 200KB. Summaries appear in `memory/topics/active-session.md`.
- **Milestone Detection:** Logs notable events (git push, builds, deep work, self-care misses) to `memory/logs/milestone-alerts.log`. Digests sent at 9 AM, 2 PM, 9 PM.

### Flow-Aware Scheduling

- **Quiet Hours:** 10 PM - 7 AM (configurable). Non-emergency alerts suppressed.
- **Deep Work Detection:** Blocks normal alerts during sustained activity. High-priority still allowed.
- **Adaptive Frequency:** Empire health check runs every 30 min but skips if system is stable.
- **Persona Routing:** (Phase 3) Alerts route to appropriate persona channels.

### Personal Dashboard

- Generates `dashboard/latest.html` every 30 minutes.
- View anytime: open `skills/spencer-proactive-agent/dashboard/latest.html` in browser.
- Shows empire health, buffer size, recent milestones, color-coded.

### Time-Savers

- **Auto-Obsidian Sync:** Hourly sync of `memory/facts/` and `TASKS.md` to your Obsidian vault.
- **Skill Auto-Registration:** Maintains `skills/.openclaw/skills-registry.json` automatically.
- **Discord Shortcuts:** Quick messages via `.\scripts\discord-shortcuts.ps1 -Preset morning`.
- **GitHub Shortcuts:** `.\scripts\github-shortcuts.ps1 -Action pr -Title "..." -Body "..."`.
- **Credential Vault:** `.\scripts\credential-vault.ps1 -Action set -Name openrouter -Value <token>`.

### Proactive Documentation

- **Auto-README:** Adds badges to `README.md` on commit (basic).
- **Wiki Sync:** Syncs `docs/` to Obsidian wiki daily at 9 AM.
- **Empire Registry:** Generates `PROJECTS.md` from `TASKS.md` and flags stale projects.

---

## Configuration

Edit `config/spencer-agent-v2.json` to toggle features:

```json
{
  "features": {
    "invisible-assistant": { "enabled": true },
    "flow-aware-scheduling": { "enabled": true },
    "personal-dashboard": { "enabled": true },
    "time-savers": { "enabled": true },
    "proactive-docs": { "enabled": true }
  }
}
```

Advanced settings:

- `flow-aware-scheduling.quietHours`: start/end times
- `invisible-assistant.bufferCompression.thresholdBytes`: buffer size threshold
- `flow-aware-scheduling.adaptiveFrequency`: interval heuristics

---

## Cron Jobs Reference

| Job | Schedule | Description |
|-----|----------|-------------|
| Working Buffer Monitor | every 30 min | Context % and rotation |
| Buffer Compression | every 5 min | Auto-compress SESSION-STATE.md |
| Empire Health Check | every 30 min (adaptive) | Monitors income_bot |
| Daily Digest (Morning/Afternoon/Evening) | 9 AM, 2 PM, 9 PM | Batch milestones + buffer |
| Personal Dashboard Generation | every 30 min | Creates HTML dashboard |
| Auto-Obsidian Sync | hourly | Sync notes to Obsidian |
| Skill Auto-Registration | 3 AM daily | Updates skills registry |
| Wiki Sync | 9 AM daily | Syncs docs to wiki |
| Empire Registry Update | 10 AM daily | Updates PROJECTS.md |
| Daily Note Check | 8 AM daily | Reminds if missing |
| Weekly Metrics Summary | Sunday 10 AM | Empire progress report |
| Monthly Review | 1st of month 9 AM | Month-in-review |
| Wellness Harmony | every 6 hours | Coordinates self-care |
| Perimeter Monitor | hourly | Security file watcher |
| Security Audit | Sunday 6 AM | Security posture scan |
| Behavioral Auth | every 2 hours | Anomaly detection |
| Encrypt Logs | 2 AM daily | EFS encryption of logs |
| Rhythm Intelligence | 8 AM daily | Learns daily patterns |
| Habit Streaks | 8:30 AM daily | Checks habit completion |
| Spencer Metrics | 7 AM daily | KPIs report |
| Experiment Runner | Sunday 11 AM | Micro-experiment status |
| Weekly Sprint Summary | Sunday 10 AM | Sprint review |
| Performance Maintenance | Sunday 3 AM | Log compression, cleanup |

(Disabled by default: Notion Sync, Voice Summary)

---

## Interacting with the Agent

### Manual Commands

Run any script directly:

```powershell
.\scripts\generate-dashboard.ps1
.\scripts\spencer-metrics.ps1
.\scripts\decision-replay.ps1 -TargetFile "skills/spencer-proactive-agent/scripts/Compress-Buffer.ps1"
.\scripts\habit-streaks.ps1 -HabitName exercise
.\scripts\discord-shortcuts.ps1 -Preset deep-work
.\scripts\github-shortcuts.ps1 -Action issue -Title "Bug" -Body "Description"
.\scripts\credential-vault.ps1 -Action set -Name openrouter -Value "sk-..."
```

### Slack/Discord Integration

The agent posts to `#atlas` by default. To send custom messages:

```powershell
.\scripts\discord-shortcuts.ps1 -Preset morning
```

Or with custom text:

```powershell
.\scripts\discord-shortcuts.ps1 -Custom "Status: Deep work until noon, emergency only."
```

### Viewing Logs

- Cron activity: check `memory/logs/` for logs from each script.
- Buffer events: `memory/logs/buffer-compression.log`
- Milestones: `memory/logs/milestone-alerts.log`
- Security alerts: `memory/topics/perimeter-state.json`

---

## Testing & Validation

### Smoke Tests

1. **Buffer Compression:**
   - Artificially inflate `SESSION-STATE.md` to >200KB.
   - Run `.\\scripts\\Compress-Buffer.ps1`.
   - Verify `memory/topics/active-session.md` created and `SESSION-STATE.md` <200KB.

2. **Daily Digest:**
   - Run `.\\scripts\\daily-digest.ps1 -DigestType morning`.
   - Check output is valid JSON and readable message.

3. **Flow Context:**
   - Run `.\\scripts\\flow-context.ps1`.
   - Verify `memory/topics/flow-state.json` created.

4. **Dashboard:**
   - Run `.\\scripts\\generate-dashboard.ps1`.
   - Open `dashboard/latest.html` in browser.

5. **Security:**
   - Run `.\\scripts\\perimeter-monitor.ps1`.
   - Modify a sensitive file, ensure alert appears.

---

## Rollback

If any feature causes issues, disable in `config/spencer-agent-v2.json` and restart relevant cron jobs. You can also uninstall cron jobs:

```powershell
.\scheduling\uninstall-cron.ps1
```

To revert a specific change, use Git:

```powershell
cd C:\Users\spenc\.openclaw\workspace
git log --oneline skills/spencer-proactive-agent
git revert <commit-hash>
```

---

## Troubleshooting

### No alerts are being sent

- Check `config/spencer-agent-v2.json` feature flags.
- Verify Discord integration script exists: `integrations/discord.ps1`.
- Ensure flow state isn't suppressing: check `memory/topics/flow-state.json`.

### Compression not triggering

- Verify `SESSION-STATE.md` size exceeds 200,000 bytes.
- Check `memory/logs/buffer-compression.log` for errors.
- Ensure `working-buffer.ps1` is running in cron.

### Dashboard not updating

- Verify cron job `proactive-dashboard-generate` is enabled.
- Check `memory/topics/empire-metrics.md` exists (dashboard reads from it).
- Run `generate-dashboard.ps1` manually to see errors.

### Notion sync fails

- Ensure `config/notion-sync.json` has valid `integrationToken` and `databaseId`.
- Notion API requires `databaseId` and integration with correct capabilities.

---

## Performance Notes

- Cron jobs run in isolated sessions; load on main agent is minimal.
- Buffer compression runs every 5 min but actual work only on threshold exceed.
- Adaptive frequency reduces empire health checks when stable.
- Log encryption (cipher) is fast; runs at 2 AM.

---

## Appendix: File Structure

```
skills/spencer-proactive-agent/
├── config/
│   ├── spencer-agent-v2.json
│   └── notion-sync.json
├── scripts/
│   ├── Compress-Buffer.ps1
│   ├── working-buffer.ps1
│   ├── flow-context.ps1
│   ├── Assert-Flow.ps1
│   ├── daily-digest.ps1
│   ├── generate-dashboard.ps1
│   ├── auto-obsidian-sync.ps1
│   ├── skill-auto-register.ps1
│   ├── discord-shortcuts.ps1
│   ├── github-shortcuts.ps1
│   ├── credential-vault.ps1
│   ├── auto-readme.ps1
│   ├── wiki-sync.ps1
│   ├── empire-registry.ps1
│   ├── rhythm-intelligence.ps1
│   ├── decision-replay.ps1
│   ├── habit-streaks.ps1
│   ├── spencer-metrics.ps1
│   ├── experiment-runner.ps1
│   ├── weekly-sprint-summary.ps1
│   ├── perimeter-monitor.ps1
│   ├── security-audit.ps1
│   ├── behavioral-auth.ps1
│   ├── encrypt-logs.ps1
│   ├── notion-sync.ps1
│   ├── voice-summary.ps1
│   └── performance-maintenance.ps1
├── scheduling/
│   └── cron-jobs.json
├── memory/
│   ├── topics/
│   │   ├── active-session.md
│   │   ├── empire-metrics.md
│   │   ├── spencer-metrics.md
│   │   ├── flow-state.json
│   │   ├── empire-health-state.json
│   │   ├── habit-streaks.json
│   │   ├── rhythm-state.json
│   │   └── perimeter-state.json
│   └── logs/
│       ├── buffer-compression.log
│       ├── milestone-alerts.log
│       └── ...
├── dashboard/
│   └── latest.html
├── upgrades/ (design docs)
├── V2-PHASE-1-ACTIVATION.md
├── V2-IMPLEMENTATION-STATUS.md
└── dev/ (ECHO tracking)

```

---

**Atlas out — build your empire. 🗺️**
