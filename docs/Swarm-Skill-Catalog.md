# Swarm Skill Catalog — Complete Reference

**Maintained by:** Olympus Swarm  
**Last Updated:** 2026-02-23  
**Purpose:** Central inventory of approved and available skills for the swarm

## Core Skills (All Agents)

| Skill | Source | Version | Purpose | Status |
|-------|--------|---------|---------|--------|
| self-improving | ClawHub | 1.1.0 | Capture corrections & learnings | ✅ Recommended |
| auto-updater | ClawHub | 1.0.0 | Daily automated updates | ✅ Recommended |
| skill-creator | ClawHub | 0.1.0 | Scaffold new skills | ✅ Recommended |
| agentmail | ClawHub | 1.1.1 | Dedicated email per agent | ✅ Recommended |
| find-skills | ClawHub | 0.1.0 | Discover skills | ✅ Recommended |
| spencer-proactive-agent | Custom | 1.0.0 | Spencer-tailored proactivity | ✅ Required |

## Optional Skills (Role-Specific)

| Skill | Source | Purpose | Fit |
|-------|--------|---------|-----|
| superdesign | ClawHub | UI generation (React+Tailwind) | Coders |
| deep-research-pro | ClawHub | Advanced research & citations | Research agents |
| reflect-learn | ClawHub | Proactive reflection & file proposals | All (optional) |
| moltbook-interact | ClawHub | Moltbook API integration | Hermes |
| marketing-mode | ClawHub | Marketing copy & campaigns | Hermes |
| reddit-readonly | ClawHub | Reddit monitoring (no auth) | Research agents |
| skill-vetter | ClawHub | Skill quality & security audit | Ares |

## Skills to Avoid

- elite-longterm-memory — conflicts with vault memory model
- agent-orchestrator — may break standalone agent SOP; requires Ares audit
- Multiple UI skills per agent — choose one

## Installation

```bash
# Core batch
clawhub install self-improving auto-updater skill-creator agentmail find-skills

# Custom
# Place spencer-proactive-agent in skills/ folder (not on ClawHub)
```

## Notes

- All skills should be vetted with `skill-vetter` before adoption
- Store credentials in encrypted vault subfolder
- Follow WAL protocol; no shared state
