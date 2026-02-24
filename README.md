# The Swarm Skills 🐝

A curated collection of production-grade skills for OpenClaw agents, built by the Swarm.

## What's Inside

This repository contains custom skills developed for the OpenClaw ecosystem, including:

- **spencer-proactive-agent** - Proactive, self-improving agent architecture with WAL Protocol
- Additional skills as they're developed

## Skill Structure

Each skill follows the OpenClaw SKILL.md specification:

```
skill-name/
├── SKILL.md          # Skill definition and documentation
├── assets/           # Optional: templates, examples
├── scripts/          # Optional: installation/setup scripts
└── lib/              # Optional: skill implementation code
```

## Installation

From your OpenClaw workspace:

```bash
# Clone into your skills directory
cd ~/.openclaw/workspace-prometheus/skills
git clone https://github.com/fame0528/The-Swarm-Skills.git .

# Or add as a remote to track updates
git remote add swarm-skills https://github.com/fame0528/The-Swarm-Skills.git
git fetch swarm-skills
git checkout -b swarm-skills-main --track swarm-skills/main
```

## Development

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add your skill with complete SKILL.md documentation
4. Test with OpenClaw v2.0+
5. Submit a pull request

## License

Individual skills may have their own licenses. See each skill's SKILL.md for details.

## About

Built for the Swarm. Deployed with precision.
