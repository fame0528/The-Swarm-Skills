# Embed System Damage Assessment & Fix Plan

**Date:** 2026-02-20  
**Agent:** Atlas  
**Status:** PRE-AUTHORIZATION — No changes made yet

---

## Current State (What Is)

### Files Present
- `scripts/send-embed.js` — **DUPLICATE**, likely non-functional, can be deleted
- `utilities/send-embed.js` — **ACTIVE** version (my custom rewrite)
- `.env` contains: `DISCORD_BOT_TOKEN`, `DISCORD_WEBHOOK_BRAIN`, `DISCORD_WEBHOOK_SYSTEM`
- `swarm_log.ps1` and `notify_progress.ps1` reference `utilities/send-embed.js`
- `assets/avatars/` folder **DOES NOT EXIST**

### Working Embed System (Last Night)
According to Olympus protocol, the system was working. This implies:
- Original `send-embed.js` existed (likely in `utilities/`)
- It used **webhook-based routing** (per-channel webhooks in `.env`)
- It attached **avatars** from `assets/avatars/` as multipart attachments
- swARN_CLOG.PS1 uses webhook if available; channel ID as fallback

### What Broke
- Possibly the original `send-embed.js` was removed or overwritten during my rework
- My current `send-embed.js` uses bot token + channel ID, **ignoring webhooks**
- Avatar attachment not implemented (script only sets `icon_url` but doesn't upload file)
- No `assets/avatars/` folder exists, so even if code was correct, avatars would fail

---

## Root Cause Analysis

**Likely scenario:** The original embed system relied on:
1. Webhook URLs per persona channel (`DISCORD_WEBHOOK_<AGENT>` in .env)
2. Avatar PNG files attached via multipart/form-data
3. Simpler embed payload with author icon as attachment URL

My rewrite changed routing logic to use a single bot token with channel IDs, which:
- Bypasses webhook configuration
- Doesn't handle file attachments correctly
- May cause permission issues if bot token lacks access to all persona channels

**Why it's sending but not as "rich embeds":** The current script likely sends successfully but without avatars and possibly to wrong channels/webhooks.

---

## Proposed Fix Plan

### Option A: Restore Original Webhook-Based System (Recommended)
1. **Delete** `scripts/send-embed.js` (duplicate)
2. **Delete** current `utilities/send-embed.js` (my version)
3. **Recreate** original `utilities/send-embed.js` that:
   - Reads `DISCORD_WEBHOOK_<AGENT>` from .env first
   - Falls back to channel ID only if webhook missing
   - Properly attaches avatar PNGs using `FormData` (multart)
   - Sends minimal payload required for Discord embeds
4. **Create** `assets/avatars/` with all 10 persona PNGs
   - Need source images (likely in Obsidian vault somewhere)
5. **Test** each persona channel with a single embed

### Option B: Keep Bot Token Routing (Not Recommended)
1. Fix current `utilities/send-embed.js` to also attach avatars (requires FormData)
2. Update `.env` to include a bot token with access to all channels (already present)
3. Create avatars folder and populate
4. Change `notify_progress.ps1` to not pass channel ID (since bot can post to any)
5. **Downside:** Deviates from intended webhook architecture; more fragile

---

## Questions for Spencer

1. **Do you have backups of the original `send-embed.js` and avatar files?** If yes, restore is trivial.
2. **Should we use webhook routing (Option A) or bot token (Option B)?** Webhook is the designed system.
3. **Where are the avatar PNGs stored?** Likely in `Resources/Olympus/assets/avatars/` in Obsidian. I can copy them.
4. **Should I proceed with Option A restoration?** Await your explicit go-ahead.

---

## Immediate Actions (Pending Approval)

If you authorize **Option A**, I will:
1. Delete duplicate `scripts/send-embed.js`
2. Rebuild `utilities/send-embed.js` according to protocol (webhook-first, multipart avatars)
3. Copy avatar images from Obsidian vault to `assets/avatars/`
4. Verify `DISCORD_WEBHOOK_*` entries exist in `.env` for all 10 personas
5. Test embed in one channel (e.g., #atlas) and report back

No action taken until you say "proceed with Option A" (or give alternate instructions).

---

**I understand the priority: quality over speed. I will not act without authorization.** 🗺️