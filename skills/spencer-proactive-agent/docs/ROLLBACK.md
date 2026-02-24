# Rollback Procedure — Spencer Proactive Agent v2.0

This document describes how to roll back changes if a deployment causes issues.

---

## Scope

Rollback can be performed at two levels:

1. **Feature-level** – disable a single feature via config.
2. **Version-level** – revert the entire v2.0 deployment to prior state.

---

## 1. Quick Feature Disable

If a particular feature misbehaves, turn it off in `config/spencer-agent-v2.json`:

```json
{
  "features": {
    "flow-aware-scheduling": { "enabled": false }
  }
}
```

Save the file. The next cron run will respect the change (most scripts read config at start). No restart needed for cron; they are stateless.

**Effect:** Feature stops operating immediately; related cron jobs may still run but exit early.

---

## 2. Uninstall Cron Jobs

To stop all new v2.0 cron jobs while keeping config:

```powershell
cd C:\Users\spenc\.openclaw\workspace\skills\spencer-proactive-agent
.\scheduling\uninstall-cron.ps1
```

This removes all jobs defined in `scheduling/cron-jobs.json` from the OpenClaw cron system.

You can selectively edit `cron-jobs.json` to set `"enabled": false` for specific jobs, then run `install-cron.ps1` to apply changes.

---

## 3. Git Revert

If the code changes need to be undone:

```powershell
cd C:\Users\spenc\.openclaw\workspace
git log --oneline skills/spencer-proactive-agent
```

Find the commit you want to revert to, note its hash. Then:

```powershell
git revert <commit-hash>
```

This creates a new commit that undoes the changes. Push after testing.

**To revert the entire v2.0 branch (multiple commits):**

```powershell
git revert <first-v2-commit>..HEAD
```

Alternatively, reset to the pre-v2.0 tag if one exists:

```powershell
git reset --hard v1.0-last
```

But only do this on a clean working tree and if you're sure you won't lose needed work.

---

## 4. Full Cleanup

To completely remove v2.0 and start over:

```powershell
# Remove skill folder (warning: destroys all config/logs)
rm -r -fo skills/spencer-proactive-agent
# Restore from git
git checkout origin/main -- skills/spencer-proactive-agent
```

Or to revert only that folder to latest remote:

```powershell
git restore --source=origin/main --staged --worktree skills/spencer-proactive-agent
```

Then re-initialize.

---

## 5. Restoring Data

Most data is in `memory/` and logs. If you delete those, they may be unrecoverable unless you have backups. Git history preserves committed files; runtime logs are not committed.

If you need to restore `SESSION-STATE.md` from a backup:

```powershell
git checkout <commit-hash> -- memory/SESSION-STATE.md
```

---

## 6. After Rollback

- Notify any relevant parties (if applicable).
- Document the reason for rollback in `MEMORY.md` or incident log.
- Investigate root cause before re-enabling.

---

**Remember:** v2.0 is additive and toggleable. Use feature flags to minimize disruption.

**Atlas — safety first. 🗺️**
