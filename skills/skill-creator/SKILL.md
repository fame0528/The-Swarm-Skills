---
name: skill-creator
description: Guide for creating effective skills. Use when users want to create a new skill or update an existing one that extends capabilities with specialized knowledge, workflows, or tool integrations.
version: 0.1.0
author: chindden
homepage: https://clawhub.ai/chindden/skill-creator
changelog:
  - Initial release
metadata:
  openclaw:
    requires: []
    install: []
---

# Skill Creator

This skill provides guidance for creating, designing, and publishing OpenClaw skills.

## When to Use

- User wants to create a new skill
- User needs to update an existing skill
- User asks about skill structure, best practices, or publishing
- User wants to learn how to extend agent capabilities

## Capabilities

- Provide skill template structure
- Explain SKILL.md format and required fields
- Guide through tool integration
- Show examples of common skill patterns
- Assist with publishing to ClawHub

## Quick Reference

### Skill Structure

```
my-skill/
├── SKILL.md          # Metadata and usage instructions
├── README.md         # Optional human-friendly docs
├── scripts/          # Optional helper scripts
├── lib/              # Optional library code
└── assets/           # Optional images, templates
```

### SKILL.md Required Fields

```yaml
---
name: my-skill
description: What it does
version: 0.1.0
author: Your Name
metadata:
  openclaw:
    requires: []     # Required tools/binaries
    install: []      # Install steps
---
```

### Common Patterns

- **Tool wrapper:** Define tools in skills section, use `exec` or other tools
- **Workflow:** Chain multiple tools together in a script
- **Memory:** Use `write`, `read`, `edit` for persistent storage
- **Background:** Use `process` for long-running tasks

## Commands

User can say:
- "Create a new skill for X"
- "How do I make a skill that does Y?"
- "Help me publish my skill"
- "What's the best way to structure a skill?"

---

*This is a guide skill; it does not perform actions itself but provides instructions.*
