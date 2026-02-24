# The-Swarm-Skills

Curated skill packages for the Olympus Swarm — standalone agents with sovereign workspaces.

## Structure

```
skills/
├── self-improving/          # Capture learnings
├── auto-updater/            # Daily updates
├── spencer-proactive-agent/ # Custom proactive intelligence
├── skill-creator/           # Scaffold new skills
├── agentmail/               # Email identity
├── find-skills/             # Skill discovery
└── [optional]...
docs/
├── Swarm-Skill-Catalog.md
└── Swarm-Skill-Registry.md
scripts/
└── install-all.ps1
```

## Quick Start

```powershell
# Clone this repo into your workspace
git clone git@github.com:fame0528/The-Swarm-Skills.git
cd The-Swarm-Skills

# Run installer (copies skills to your agent's skills folder)
powershell -File scripts/install-all.ps1

# Or install individually
clawhub install skills/self-improving
```

## Standards

- All skills must respect standalone agent boundaries
- No shared state between agents
- Credentials stored encrypted in agent vaults
- WAL compliance for all decisions
- Ares security approval for production use

## Maintenance

- Update registry after installs
- Fork and modify skills to meet ECHO standards
- Submit PRs to this repo for enhancements

**Owner:** Olympus Swarm (Atlas coordination)
