# Troubleshooting Runbook — Spencer Proactive Agent v2.0

Use this guide when something isn't working as expected. Issues are organized by symptom.

---

## General Diagnostics

1. **Check logs first** — most scripts write to `memory/logs/`.
2. **Verify config** — `config/spencer-agent-v2.json` ensure feature is `enabled: true`.
3. **Run script manually** — from PowerShell in the skill directory to see errors.
4. **Check cron status** — `openclaw cron status` or `openclaw cron list`.

---

## Invisible Assistant

### Buffer compression not triggering

**Symptom:** `SESSION-STATE.md` grows beyond 200KB, no compression.

**Check:**
- Look at `memory/logs/buffer-compression.log` for errors.
- Ensure `working-buffer.ps1` cron is running (should output silently).
- Verify `config/invisible-assistant.bufferCompression.thresholdBytes` set appropriately.

**Fix:**
Manually run:
```powershell
.\scripts\Compress-Buffer.ps1
```
If it works, cron may not have permission; check OpenClaw cron logs.

### Milestone alerts not appearing

**Symptom:** Git push or build events don't show up in digest.

**Check:**
- `memory/logs/milestone-alerts.log` should have entries after pushes.
- `daily-digest.ps1` includes milestones from last 24h.
- Ensure `milestoneAlerts.enabled` is true.

**Fix:**
Make a git push in `scripts/` or `income_bot/` then re-run digest manually.

---

## Flow-Aware Scheduling

### Alerts still fire during quiet hours

**Symptom:** Receiving Discord pings at 11 PM.

**Check:**
- `memory/topics/flow-state.json` shows `"isQuietHours": true` during night.
- Verify `flow-aware-scheduling.quietHours` config.
- Ensure scripts are using `Assert-Flow.ps1`. Only scripts with flow guard respect quiet hours.

**Fix:**
Add flow check to offending script:
```powershell
. (Join-Path $PSScriptRoot "Assert-Flow.ps1")
if (-not (Test-FlowAllowed -Priority "normal")) { exit 0 }
```

### Deep work mode never activates

**Symptom:** Alerts still come through during focused work.

**Check:**
- Flow state file: `isDeepWork` should be true if typing sustained or git push.
- Deep work detection thresholds: `typingThresholdMinutes` default 15.
- Check if `SESSION-STATE.md` growing quickly? Buffer spike may trigger.

**Fix:**
Adjust thresholds in config, or set `"deepWork": { "enabled": false }` to disable.

---

## Personal Dashboard

### Dashboard HTML is broken or blank

**Symptom:** Open `dashboard/latest.html` shows error or missing data.

**Check:**
- `memory/topics/empire-metrics.md` exists and has content.
- Run `generate-dashboard.ps1` manually to see errors.
- Browser console for JS errors (should be none; inline HTML).

**Fix:**
Re-run generation; ensure permissions allow writing to `dashboard/`.

---

## Time-Savers

### Obsidian sync not copying files

**Symptom:** New daily notes not appearing in Obsidian vault.

**Check:**
- Source: `memory/facts/` contains new `.md` files.
- Destination path: default `C:\Users\spenc\Documents\Obsidian\Vaults\Atlas\Daily Notes`.
- Cron `proactive-obsidian-sync` is hourly.

**Fix:**
Run manually: `.\scripts\auto-obsidian-sync.ps1`. Verify paths.

### Skill auto-registry not updating

**Symptom:** New skill folder not recognized.

**Check:**
- Registry file: `.openclaw/skills-registry.json`.
- Skill folder has `SKILL.md`.
- Cron `proactive-skill-register` runs daily at 3 AM.

**Fix:**
Run manually: `.\scripts\skill-auto-register.ps1`. Check registry.

### GitHub shortcuts failing

**Symptom:** `gh` command not found or auth errors.

**Check:**
- GitHub CLI installed (`gh --version`).
- Authenticated (`gh auth status`).
- Correct repo in environment.

**Fix:**
Re-authenticate: `gh auth login`. Ensure `git` remote is set.

### Credential vault not storing

**Symptom:** `credential-vault.ps1 -Action set` appears to work but retrieval fails.

**Check:**
- Windows Credential Manager entries: look for `spencer-proactive-agent\<name>`.
- Use `-Action get` to verify.

**Fix:**
Ensure running as same user. Use `cmdkey /list` to view.

---

## Proactive Docs

### Wiki sync not updating Obsidian Wiki

**Symptom:** Changes in `docs/` not appearing in wiki vault.

**Check:**
- Source `docs/` folder exists with markdown files.
- Destination wiki vault path: default `Obsidian\Vaults\Wiki`.
- Cron `proactive-wiki-sync` runs daily at 9 AM.

**Fix:**
Run manually: `.\scripts\wiki-sync.ps1`. Verify paths.

### PROJECTS.md stale

**Symptom:** New tasks not reflected.

**Check:**
- `TASKS.md` updated with new tasks.
- Run `.\scripts\empire-registry.ps1` manually.
- `PROJECTS.md` under workspace root should update.

**Fix:**
Ensure TASKS.md formatting follows expected (## Project headers, - [ ] tasks).

---

## Security

### Perimeter monitor false positive

**Symptom:** Alert about sensitive file that is expected to change.

**Check:**
- `memory/topics/perimeter-state.json` tracks known hashes.
- Some config files legitimately change (e.g., `spencer-agent-v2.json`). You may need to run monitor once to establish baseline after changes.

**Fix:**
Re-establish baseline: delete `perimeter-state.json` and run monitor manually once.

### Security audit finds secret patterns

**Symptom:** Audit message about potential secret in files.

**Check:**
- The reported file and line (if any).
- Ensure it's not a false positive (e.g., placeholder text).

**Fix:**
If real secret, rotate immediately and update via `credential-vault`. Remove plaintext from file history (`git filter-branch` or BFG).

---

## Performance

### Cron jobs slowing down system

**Symptom:** High CPU or memory during agent operations.

**Check:**
- Which cron jobs are running concurrently? Use Task Manager.
- Logs under `memory/logs/` for long-running scripts.

**Fix:**
- Stagger schedules in `cron-jobs.json` to avoid overlap.
- Disable non-essential features via config.
- Ensure buffer compression threshold not too low.

---

## Rollback Procedures

### Disable a feature

Edit `config/spencer-agent-v2.json` and set the feature's `"enabled": false`. Then restart cron or wait for next cycle.

### Uninstall all cron jobs

```powershell
.\scheduling\uninstall-cron.ps1
```

### Revert to previous version

```powershell
cd C:\Users\spenc\.openclaw\workspace
git log --oneline skills/spencer-proactive-agent
git revert <bad-commit>
```

---

## Contact & Support

If you're stuck:

1. Consult this runbook.
2. Check `docs/USER-GUIDE.md`.
3. Search `memory/logs/` for clues.
4. Open an issue in the GitHub repo (`THE-ATLAS`).

---

**Atlas — Empire safety first. 🗺️**
