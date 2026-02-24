# Subagent System - Usage Guide

> How Atlas uses the subagent system in real conversations

## Integration Points

### 1. In HEARTBEAT.md

Add this check to HEARTBEAT.md:

```markdown
## 🔄 Subagent Queue

Run subagent heartbeat processing:
- Check for pending tasks to spawn
- Deliver completed results
- Run maintenance if needed
```

### 2. During Conversations

When a task is too complex for inline processing:

```javascript
// In message handler
if (shouldDelegate(task, estimatedSeconds)) {
  const { delegate } = require('./skills/subagent-system/dist/index.js');
  const { task, response } = delegate(taskDescription, options);
  
  // Send response immediately
  sendMessage(response);
  
  // Task is now queued for background processing
  return;
}
```

### 3. When to Delegate

Delegate when:
- Task involves web search/fetch
- Complex file operations
- API calls
- Code analysis
- User says "research this"
- Estimated time >30 seconds

### 4. Subagent Types

| User Request | Delegate To |
|-------------|-------------|
| "Research X", "Find out about Y" | research-agent |
| "Build X", "Create Y", "Fix Z" | code-agent |
| "Fetch API", "Process data" | data-agent |
| "Analyze X", "Review Y", "Audit Z" | analysis-agent |

## Example Flow

### User: "Research best practices for JWT authentication"

1. **Main session detects delegation opportunity**
2. **Call delegate():**
   ```javascript
   const { task, response } = delegate(
     "Research best practices for JWT authentication",
     { type: 'research-agent', priority: 'HIGH' }
   );
   ```
3. **response:**
   ```
   🔄 Delegated to research subagent
   
   Task: Research best practices for JWT authentication
   ETA: ~4 minutes
   
   I'll notify you when it's complete.
   ```
4. **Send response immediately** — main thread unblocked
5. **During next heartbeat:**
   - processQueue() returns the task
   - sessions_spawn() creates subagent
   - recordSpawn() marks as running
6. **When subagent completes:**
   - Sessions system notifies main session
   - onSubagentComplete() called
   - Result saved to file
7. **Next heartbeat:**
   - Result delivered to user
   ```
   📬 Subagent Complete: research
   
   Task: Research best practices for JWT authentication
   Duration: 2m 15s
   
   Result: Found 5 major approaches including...
   Recommendation: Use RS256 for production apps
   ```

## Priority Guidelines

| Priority | When to Use |
|----------|-------------|
| URGENT | "Right now", "ASAP", blocking conversation |
| HIGH | User waiting, normal requests |
| NORMAL | Background tasks, "when you can" |
| BACKGROUND | "Eventually", no rush |

## Current Status

Run `node check-queue.js` to see queue status:

```bash
cd ~/.openclaw/workspace/skills/subagent-system
node check-queue.js
```

Output:
```
Queue Status:
  Pending: 0
  Running: 0
  Completed: 3
  Health: healthy
```

---

This system is ACTIVE and ready for use.
