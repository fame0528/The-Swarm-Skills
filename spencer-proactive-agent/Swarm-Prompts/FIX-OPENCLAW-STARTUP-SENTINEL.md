# 🦞 SWARM ACTIVATION: Fix OpenClaw Startup & Sentinel Watchdog

**Mission:** Diagnose and repair the OpenClaw startup batch files (Start_OpenClaw.bat, Restart_OpenClaw.bat, Stop_OpenClaw.bat) and the Sentinel watchdog service. Ensure the system works as intended: single-click Start_OpenClaw launches OpenClaw gateway, Atlas agent, and Sentinel monitor; Sentinel automatically recovers the gateway if it crashes; all three components are managed correctly.

**CRITICAL REQUIREMENTS:**

1. **SINGLE-THREAD EXECUTION ONLY:** Use personas for all work. No subagents. Run in a single continuous thread with persona routing.
2. **ECHO COMPLIANT:** Complete File Reading Law — read all existing scripts fully before making changes.
3. **NO NARRATION IN #atlas:** All progress updates go to persona channels only via `notify_progress.ps1`.
4. **USE swarm_log.ps1:** Log every action to the Obsidian swarm log.
5. **SECURE RESTART:** After fixes, the system must be restart-proof with Sentinel watchdog active.

---

## 📋 Background & Expected Behavior

**What the system SHOULD do:**

1. User double-clicks **Start_OpenClaw.bat**
   - Starts OpenClaw gateway service
   - Starts Atlas agent (main session)
   - Starts Sentinel watchdog process (PowerShell) that monitors both gateway and Atlas
   - If gateway crashes, Sentinel auto-restarts it
   - If Atlas crashes, Sentinel auto-restarts it
   - Provides "never any down time" assurance

2. User double-clicks **Restart_OpenClaw.bat**
   - Stops all three components cleanly
   - Waits for processes to exit
   - Then runs Start_OpenClaw.bat sequence

3. User double-clicks **Stop_OpenClaw.bat**
   - Stops all three components cleanly
   - Terminates Sentinel watchdog

4. **Sentinel Watchdog** (PowerShell script, likely `sentinel.ps1` or similar)
   - Runs in background as a scheduled task or persistent process
   - Polls gateway health every 30-60 seconds
   - Polls Atlas session health
   - On failure: attempts graceful restart, escalates if repeated failures
   - Logs to file, not to chat

---

## 🔍 Diagnosis Tasks

### For each batch file (Start, Restart, Stop):
1. Read the current .bat file content fully
2. Identify what commands it runs (gateway start, agent spawn, sentinel launch)
3. Check for:
   - Proper process management (waiting for exits, PID tracking)
   - Error handling (if a component fails to start)
   - Order of operations (gateway first, then agent, then sentinel)
   - Use of `start`, `call`, `start /wait` correctly
   - Environment variable setting (OPENCLAW_HOME, etc.)
4. Document what's broken (e.g., sentinel not launching, gateway not monitored, race conditions)

### For Sentinel watchdog:
1. Locate the Sentinel PowerShell script (likely in `skills/sentinel/` or workspace root)
2. Read it fully — understand:
   - How it detects gateway status (process existence, port check, HTTP endpoint?)
   - How it detects Atlas status (session query, process check)
   - Restart logic (how many retries, backoff)
   - Logging destination
   - How it's launched (from Start_OpenClaw.bat? scheduled task?)
3. Identify failures:
   - Not starting at all?
   - Starting but not monitoring?
   - Monitoring but not recovering?
   - Logging errors?
   - Process conflicts?

---

## 🛠️ Repair Tasks

After diagnosis, produce fixed versions:

### Start_OpenClaw.bat
Should:
```batch
@echo off
cd /d "C:\Users\spenc\.openclaw\workspace"
REM Start gateway
call openclaw gateway start
REM Wait for gateway to be ready
timeout /t 5 /nobreak >nul
REM Start Atlas agent (main session)
start "" "C:\path\to\openclaw.exe" agent run --session main
REM Wait a moment
timeout /t 2 /nobreak >nul
REM Start Sentinel watchdog in background (persistent)
start "" powershell.exe -NoProfile -WindowStyle Hidden -File "C:\Users\spenc\.openclaw\workspace\skills\sentinel\scripts\sentinel.ps1"
echo All systems started. Sentinel watchdog active.
```

### Restart_OpenClaw.bat
Should:
```batch
@echo off
call Stop_OpenClaw.bat
timeout /t 3 /nobreak >nul
call Start_OpenClaw.bat
```

### Stop_OpenClaw.bat
Should:
```batch
@echo off
REM Stop Sentinel first (so it doesn't restart during shutdown)
taskkill /f /im sentinel.ps1 2>nul
REM Stop OpenClaw gateway
call openclaw gateway stop
REM Stop Atlas agent (find process and kill)
taskkill /f /fi "WINDOWTITLE eq Atlas*" 2>nul
echo All systems stopped.
```

### Sentinel Watchdog (sentinel.ps1)
Should:
- Run in infinite loop with 30-second sleep
- Check: `openclaw gateway status` — if not "running", restart it
- Check: `openclaw sessions list` — if main session missing, restart agent: `openclaw agent run --session main`
- Log all events to `memory/logs/sentinel.log` with timestamps
- Exit cleanly on keyboard interrupt
- **Never** write to Discord chat (silent monitoring)
- Use `try/catch` to prevent crashes

---

## 📝 Implementation Rules

1. **Preserve existing configurations** — don't change workspace paths unless necessary
2. **Backup originals** — before overwriting, copy `.bat` files to `.bak` with date stamp
3. **Test locally** — after writing fixes, describe how to test each script manually
4. **Document changes** — add comments in batch files explaining what each line does
5. **Make restart-proof** — sentinel should survive gateway crashes and auto-recover

---

## 📁 Expected File Locations

- Batch files: `C:\Users\spenc\Documents\OpenClaw\` (or wherever Spencer keeps them)
- OpenClaw workspace: `C:\Users\spenc\.openclaw\workspace\`
- Sentinel script: `C:\Users\spenc\.openclaw\workspace\skills\sentinel\scripts\sentinel.ps1`
- Logs: `C:\Users\spenc\.openclaw\workspace\memory\logs\`

**If files are elsewhere, adapt paths accordingly.** Spencer's actual setup may vary.

---

## 🎯 Success Criteria

- ✅ `Start_OpenClaw.bat` launches all three components correctly (gateway, Atlas, Sentinel)
- ✅ Sentinel monitors gateway and Atlas, auto-restarts on failure
- ✅ `Restart_OpenClaw.bat` cleanly stops then starts everything
- ✅ `Stop_OpenClaw.bat` cleanly stops all components including Sentinel
- ✅ No manual intervention needed after clicking Start
- ✅ Sentinel logs to file, not to chat
- ✅ System uptime: 99.9% (gateway never stays down >30 seconds)

---

## 🚀 Execution Sequence

1. **Initialize swarm:** `swarm_log.ps1 -Action init -Mission 'Fix OpenClaw Startup & Sentinel'`
2. **Assign personas:**
   - **hephaestus:** Diagnose batch files, rewrite with proper process management
   - **atlas:** Orchestrate, verify end-to-end flow, document final procedures
   - **sentinel:** (If exists as persona) review watchdog logic; otherwise hephaestus handles
3. **Diagnose phase:** Each persona reads existing files, reports issues to their channel via `notify_progress.ps1`
4. **Repair phase:** Generate fixed .bat and .ps1 files with proper error handling
5. **Test plan:** Describe manual verification steps Spencer can run
6. **Finalize:** `swarm_log.ps1 -Action finalize -Summary 'Startup system repaired. All 3 batch files fixed, Sentinel watchdog operational.'`
7. **Report to #atlas:** Single embed with summary, new file locations, and test instructions

---

## ⚠️ Important Notes

- **Do not assume file locations** — if standard paths don't exist, ask Spencer to provide actual paths before proceeding
- **Preserve Spencer's environment** — his setup may be customized
- **No external dependencies** — use only OpenClaw CLI and PowerShell
- **Single-thread discipline:** Only one persona works at a time, no parallel subagents
- **Zero noise in #atlas:** All intermediate chatter in persona channels only

---

**Begin immediately. Hephaestus, start by locating and reading the existing batch files. Atlas, monitor progress.** 🦞
