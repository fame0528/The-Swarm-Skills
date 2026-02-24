# The Swarm Skills 🐝

A curated collection of production-grade skills for OpenClaw agents, built by the Swarm.

## Structure

```
The-Swarm-Skills/
├── skills/                    # All skills organized by name
│   ├── spencer-proactive-agent/
│   ├── agentmail/
│   ├── auto-updater/
│   ├── clawdhub/
│   ├── deep-research-pro/
│   ├── frontend-design-ultimate/
│   ├── marketing-mode/
│   ├── reflect-learn/
│   ├── self-improving-agent/
│   ├── self-improving-agent1/
│   ├── sendclaw-email/
│   ├── skill-creator/
│   ├── skill-vetter/
│   ├── subagent-system/
│   ├── superdesign/
│   └── ...more skills
├── docs/
│   ├── Swarm-Skill-Catalog.md  # Comprehensive reference
│   └── Swarm-Skill-Registry.md # Installation registry
├── scripts/
│   └── install-all.ps1         # Bulk installer
├── README.md
└── .gitignore
```

## What's Inside

This repository contains custom skills developed for the OpenClaw ecosystem, including:

- **spencer-proactive-agent** v3.1.0 — Proactive, self-improving agent architecture with WAL Protocol
- **agentmail** — Agent-friendly email platform
- **auto-updater** — Daily skill updates
- **clawdhub** — Skill registry client
- **deep-research-pro** — Multi-source research
- **frontend-design-ultimate** — Production-grade UI generation
- **marketing-mode** — Complete marketing stack
- **reflect-learn** — Continuous learning system
- **self-improving-agent** — Self-improvement framework
- **sendclaw-email** — Autonomous email sending
- **skill-creator** — Scaffold new skills quickly
- **skill-vetter** — Security-first skill vetting
- **subagent-system** — Task queue & orchestration
- **superdesign** — Design guidelines
- And more...

## Standards

All skills must respect:
- ✅ Standalone agent boundaries
- ✅ No shared state between agents
- ✅ Credentials stored encrypted in agent vaults
- ✅ WAL compliance for all decisions
- ✅ Ares security approval for production use
- ✅ AAA quality — no shortcuts

## Installation

From your OpenClaw workspace:

```powershell
# Clone this repo
git clone https://github.com/fame0528/The-Swarm-Skills.git
cd The-Swarm-Skills

# Run installer (copies skills to your agent's skills folder)
powershell -File scripts/install-all.ps1

# Or install individually using ClawHub
clawhub install skills/spencer-proactive-agent
```

## Development

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add your skill with complete SKILL.md documentation
4. Test with OpenClaw v2.0+
5. Submit a pull request

Individual skills may have their own licenses. See each skill's SKILL.md for details.

## About

Built for the Swarm. Deployed with precision.

---

**Owner:** Olympus Swarm (Atlas coordination)
**Repository:** https://github.com/fame0528/The-Swarm-Skills
