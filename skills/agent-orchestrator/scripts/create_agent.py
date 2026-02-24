#!/usr/bin/env python3
"""
Create a new sub-agent workspace with standard directory structure.

Usage:
    python3 create_agent.py <agent-name> --workspace <path> [--template <type>]

Example:
    python3 create_agent.py data-collector --workspace ./agents --template research
"""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path

# Agent templates available
TEMPLATES = {
    "research": {
        "description": "Autonomous research agent for gathering and organizing information",
        "tools": ["WebSearch", "WebFetch", "Read"],
        "outputs": ["findings.md", "sources.md", "summary.md"]
    },
    "code": {
        "description": "Autonomous coding agent for implementation tasks",
        "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
        "outputs": ["code/", "tests/", "changelog.md"]
    },
    "analysis": {
        "description": "Autonomous analysis agent for data processing and insights",
        "tools": ["Read", "Bash", "Write"],
        "outputs": ["analysis.md", "insights.md", "data/", "charts/"]
    },
    "writer": {
        "description": "Autonomous writing agent for content creation",
        "tools": ["Read", "Write"],
        "outputs": ["draft.md", "outline.md", "notes.md"]
    },
    "review": {
        "description": "Autonomous review agent for quality assurance",
        "tools": ["Read", "Write", "Edit", "Grep"],
        "outputs": ["reviewed/", "feedback.md", "issues.md", "approved.json"]
    },
    "integration": {
        "description": "Autonomous integration agent for merging work",
        "tools": ["Read", "Write", "Bash"],
        "outputs": ["integrated/", "merge_report.md", "conflicts.md"]
    },
    "generic": {
        "description": "General-purpose autonomous agent",
        "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
        "outputs": ["output/", "summary.md"]
    }
}


def create_agent_workspace(agent_name: str, workspace: str, template: str = "generic") -> Path:
    """Create a new agent workspace with standard structure."""

    workspace_path = Path(workspace)
    agent_path = workspace_path / agent_name

    # Create directory structure
    directories = [
        agent_path,
        agent_path / "inbox",
        agent_path / "outbox",
        agent_path / "workspace"
    ]

    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)

    # Get template config
    config = TEMPLATES.get(template, TEMPLATES["generic"])

    # Create SKILL.md
    skill_content = generate_skill_md(agent_name, config)
    (agent_path / "SKILL.md").write_text(skill_content)

    # Create initial status.json
    status = {
        "state": "pending",
        "created": datetime.utcnow().isoformat() + "Z",
        "started": None,
        "completed": None,
        "error": None,
        "progress": {
            "current_step": None,
            "steps_completed": 0,
            "total_steps": None
        },
        "metrics": {}
    }
    (agent_path / "status.json").write_text(json.dumps(status, indent=2))

    # Create placeholder instructions.md
    instructions = """# Task Instructions

## Objective
[TO BE FILLED BY ORCHESTRATOR]

## Context
[TO BE FILLED BY ORCHESTRATOR]

## Inputs Provided
- None yet

## Requirements
1. [TO BE FILLED BY ORCHESTRATOR]

## Success Criteria
- [ ] [TO BE FILLED BY ORCHESTRATOR]

## Output Expectations
- Place deliverables in `outbox/`
- Include `outbox/summary.md` with work summary
"""
    (agent_path / "inbox" / "instructions.md").write_text(instructions)

    return agent_path


def generate_skill_md(agent_name: str, config: dict) -> str:
    """Generate a SKILL.md file for the agent."""

    tools_list = "\n".join([f"- {tool}" for tool in config["tools"]])
    outputs_list = "\n".join([f"- `outbox/{out}`" for out in config["outputs"]])

    return f"""---
name: {agent_name}
description: |
  {config['description']}.
  Reads task from inbox/instructions.md, outputs to outbox/.
---

# {agent_name.replace('-', ' ').title()}

## Objective
Read objective from `inbox/instructions.md`

## Tools Available
{tools_list}

## Workflow

1. Read `inbox/instructions.md` for task requirements
2. Read any input files from `inbox/`
3. Update `status.json` to `{{"state": "running"}}`
4. Execute the task according to instructions
5. Write all outputs to `outbox/`
6. Update `status.json` to `{{"state": "completed"}}`

## Expected Outputs
{outputs_list}
- `outbox/summary.md` - Brief summary of work done

## Success Criteria
As specified in `inbox/instructions.md`

## Communication Protocol
- Read from: `inbox/`
- Write to: `outbox/`
- Workspace: `workspace/` (for intermediate files)
- Status: `status.json`

## Error Handling
If task cannot be completed:
1. Update `status.json` with `{{"state": "failed", "error": {{...}}}}`
2. Write `outbox/error_report.md` explaining the issue
3. Save any partial work to `outbox/partial/`
"""


def main():
    parser = argparse.ArgumentParser(
        description="Create a new sub-agent workspace"
    )
    parser.add_argument(
        "agent_name",
        help="Name of the agent (e.g., data-collector)"
    )
    parser.add_argument(
        "--workspace",
        required=True,
        help="Parent directory for agent workspaces"
    )
    parser.add_argument(
        "--template",
        choices=list(TEMPLATES.keys()),
        default="generic",
        help="Agent template type (default: generic)"
    )

    args = parser.parse_args()

    agent_path = create_agent_workspace(
        args.agent_name,
        args.workspace,
        args.template
    )

    print(f"✅ Created agent workspace: {agent_path}")
    print(f"   Template: {args.template}")
    print(f"\nStructure:")
    print(f"   {agent_path}/")
    print(f"   ├── SKILL.md")
    print(f"   ├── status.json")
    print(f"   ├── inbox/")
    print(f"   │   └── instructions.md")
    print(f"   ├── outbox/")
    print(f"   └── workspace/")
    print(f"\nNext steps:")
    print(f"   1. Edit inbox/instructions.md with task details")
    print(f"   2. Copy input files to inbox/")
    print(f"   3. Spawn the agent with Task tool")


if __name__ == "__main__":
    main()
