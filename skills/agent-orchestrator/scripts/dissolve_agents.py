#!/usr/bin/env python3
"""
Dissolve agent workspaces after task completion.

Archives outputs, cleans up workspaces, and generates a summary report.

Usage:
    python3 dissolve_agents.py --workspace <path> [--archive] [--keep-outputs]

Example:
    python3 dissolve_agents.py --workspace ./agents --archive
"""

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path


def collect_agent_status(agent_path: Path) -> dict:
    """Read an agent's status and summary."""
    status_file = agent_path / "status.json"
    summary_file = agent_path / "outbox" / "summary.md"

    status = {}
    if status_file.exists():
        status = json.loads(status_file.read_text())

    summary = ""
    if summary_file.exists():
        summary = summary_file.read_text()

    outputs = []
    outbox = agent_path / "outbox"
    if outbox.exists():
        outputs = [str(f.relative_to(outbox)) for f in outbox.rglob("*") if f.is_file()]

    return {
        "name": agent_path.name,
        "state": status.get("state", "unknown"),
        "started": status.get("started"),
        "completed": status.get("completed"),
        "error": status.get("error"),
        "metrics": status.get("metrics", {}),
        "summary": summary[:500] if summary else None,
        "outputs": outputs
    }


def generate_dissolution_report(agents: list, workspace: Path) -> str:
    """Generate a report summarizing all agent work."""

    completed = [a for a in agents if a["state"] == "completed"]
    failed = [a for a in agents if a["state"] == "failed"]
    other = [a for a in agents if a["state"] not in ("completed", "failed")]

    report = f"""# Orchestration Dissolution Report

Generated: {datetime.utcnow().isoformat()}Z
Workspace: {workspace}

## Summary

| Status | Count |
|--------|-------|
| Completed | {len(completed)} |
| Failed | {len(failed)} |
| Other | {len(other)} |
| **Total** | **{len(agents)}** |

## Agent Details

"""

    for agent in agents:
        status_emoji = "✅" if agent["state"] == "completed" else "❌" if agent["state"] == "failed" else "⏳"
        report += f"""### {status_emoji} {agent['name']}

- **Status**: {agent['state']}
- **Started**: {agent['started'] or 'N/A'}
- **Completed**: {agent['completed'] or 'N/A'}
"""
        if agent["error"]:
            report += f"- **Error**: {agent['error']}\n"

        if agent["metrics"]:
            report += f"- **Metrics**: {json.dumps(agent['metrics'])}\n"

        if agent["outputs"]:
            report += f"- **Outputs**: {len(agent['outputs'])} files\n"
            for out in agent["outputs"][:5]:
                report += f"  - `{out}`\n"
            if len(agent["outputs"]) > 5:
                report += f"  - ... and {len(agent['outputs']) - 5} more\n"

        if agent["summary"]:
            report += f"\n**Summary**:\n{agent['summary'][:300]}...\n" if len(agent["summary"]) > 300 else f"\n**Summary**:\n{agent['summary']}\n"

        report += "\n"

    return report


def dissolve_agents(workspace: str, archive: bool = False, keep_outputs: bool = False):
    """Dissolve all agents in the workspace."""

    workspace_path = Path(workspace)

    if not workspace_path.exists():
        print(f"❌ Workspace not found: {workspace}")
        return

    # Find all agent directories (those with status.json)
    agent_paths = [
        d for d in workspace_path.iterdir()
        if d.is_dir() and (d / "status.json").exists()
    ]

    if not agent_paths:
        print(f"❌ No agents found in: {workspace}")
        return

    print(f"Found {len(agent_paths)} agents to dissolve")

    # Collect status from all agents
    agents = [collect_agent_status(p) for p in agent_paths]

    # Generate dissolution report
    report = generate_dissolution_report(agents, workspace_path)
    report_path = workspace_path / "dissolution_report.md"
    report_path.write_text(report)
    print(f"📄 Generated report: {report_path}")

    # Archive if requested
    if archive:
        archive_path = workspace_path / f"archive_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        archive_path.mkdir()

        for agent_path in agent_paths:
            dest = archive_path / agent_path.name
            shutil.copytree(agent_path, dest)

        print(f"📦 Archived to: {archive_path}")

    # Consolidate outputs if requested
    if keep_outputs:
        outputs_path = workspace_path / "consolidated_outputs"
        outputs_path.mkdir(exist_ok=True)

        for agent_path in agent_paths:
            outbox = agent_path / "outbox"
            if outbox.exists():
                dest = outputs_path / agent_path.name
                shutil.copytree(outbox, dest, dirs_exist_ok=True)

        print(f"📂 Consolidated outputs: {outputs_path}")

    # Clean up agent directories (excluding archive and consolidated)
    for agent_path in agent_paths:
        if not archive:  # If we're not archiving, just clean workspace
            workspace_dir = agent_path / "workspace"
            if workspace_dir.exists():
                shutil.rmtree(workspace_dir)
                workspace_dir.mkdir()
            print(f"🧹 Cleaned workspace: {agent_path.name}")
        else:  # If archived, we can remove the original
            shutil.rmtree(agent_path)
            print(f"🗑️  Removed: {agent_path.name}")

    print(f"\n✅ Dissolution complete!")
    print(f"   Report: {report_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Dissolve agent workspaces after task completion"
    )
    parser.add_argument(
        "--workspace",
        required=True,
        help="Directory containing agent workspaces"
    )
    parser.add_argument(
        "--archive",
        action="store_true",
        help="Archive agent workspaces before cleanup"
    )
    parser.add_argument(
        "--keep-outputs",
        action="store_true",
        help="Consolidate all outputs into a single directory"
    )

    args = parser.parse_args()

    dissolve_agents(
        args.workspace,
        archive=args.archive,
        keep_outputs=args.keep_outputs
    )


if __name__ == "__main__":
    main()
