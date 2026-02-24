# Agent Orchestrator

Meta-agent skill for orchestrating complex tasks through autonomous sub-agents.

## Features

- **Task Decomposition**: Break macro tasks into parallelizable subtasks
- **Agent Generation**: Create workspaces with dynamic SKILL.md files
- **File-Based Communication**: Agents communicate via inbox/outbox directories
- **Autonomous Execution**: Sub-agents work independently until completion
- **Consolidation**: Collect and merge outputs from all agents

## Structure

```
agent-orchestrator/
├── SKILL.md                           # Core orchestration workflow
├── references/
│   ├── sub-agent-templates.md         # Pre-built agent templates
│   └── communication-protocol.md      # File-based communication specs
└── scripts/
    ├── create_agent.py                # Creates agent workspaces
    └── dissolve_agents.py             # Cleans up & archives agents
```

## Usage

1. Install the skill in your Claude Code environment
2. Use triggers like "orchestrate", "spawn agents", "decompose task"
3. Follow the 6-phase workflow in SKILL.md

## License

MIT
