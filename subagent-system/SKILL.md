# Subagent System - Atlas Integration

> Orchestration layer for task delegation. Use this to spawn background workers for complex tasks.

## Purpose

Keeps the main session responsive by delegating heavy work (research, coding, analysis) to subagents.

## When to Use

- Tasks requiring >30 seconds of tool execution (e.g., deep research).
- When you want to continue chatting with the user while work happens in parallel.
- Background maintenance or long-running processing.

## Usage (CLI Only)

**IMPORTANT:** Always use these CLI commands. Do NOT attempt to call JavaScript functions directly.

### 1. Delegate a Task
Execute this command in `C:\\Users\\spenc\\.openclaw\\workspace-prometheus\\skills\subagent-system`:
```bash
node dist/delegate.js --task "Research the history of KY" --label "research"
```
**Response:** You will get a JSON object confirming the task is queued. Tell the user "On it. I've spawned a research subagent to handle this." then STOP.

### 2. Run Heartbeat (Maintenance)
Execute this command in `C:\Users\spenc\.openclaw\workspace`:
```bash
node subagent-heartbeat.js
```
**Effect:** This processes the queue, spawns pending tasks, and prepares results for delivery.

## Logic Flow

1. **Delegate:** Task added to `task-queue.json`.
2. **Heartbeat:** `subagent-heartbeat.js` checks queue, calls `sessions_spawn` for pending tasks.
3. **Execution:** Subagent works in isolated session, saves result to `results/`.
4. **Delivery:** Next heartbeat delivers the result back to the main session.

## System Files

- `task-queue.json` — Active queue state.
- `results/` — Completed results.
- `subagent-heartbeat.js` — Core maintenance script (in workspace root).

---
Built by Atlas, 2026-02-10

