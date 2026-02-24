const { 
  init, 
  processQueue, 
  recordSpawn, 
  onTaskStarted,
  getStatus,
  maintenance 
} = require('./enhanced-integration.js');

// Import delivery functions
const { getPendingDeliveries, confirmDelivery, recordDeliveryAttempt } = require('./dist/delivery.js');
const { getTask, markTaskFailed } = require('./dist/queue.js');

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

// Initialize on startup
init();
console.log('[subagent-processor] Started - polling every 30 seconds');

setInterval(() => {
  try {
    // Process queue and spawn tasks
    const toSpawn = processQueue();
    
    // Spawn each task via OpenClaw API
    for (const { task, prompt, spawnOptions } of toSpawn) {
      // We're in a separate process - need to call sessions_spawn
      // This script will be run via openclaw cron, so sessions_spawn is available
      const sessionId = sessions_spawn({
        task: prompt,
        ...spawnOptions
      });
      recordSpawn(task.id, sessionId);
      onTaskStarted(task.id, sessionId);
      console.log(`[subagent-processor] Spawned task ${task.id} -> session ${sessionId}`);
    }

    // Deliver completed results (max 3 per heartbeat)
    const pendingDeliveries = getPendingDeliveries();
    const deliveriesToProcess = pendingDeliveries.slice(0, 3);
    let delivered = 0;
    for (const delivery of deliveriesToProcess) {
      const taskId = delivery.taskId;
      const task = getTask(taskId);
      if (!task) continue;
      try {
        // Format and send result (delivery.message already formatted)
        message({ action: 'send', message: delivery.message, target: 'main' });
        // Success: mark delivered
        confirmDelivery(taskId);
        delivered++;
        console.log(`[subagent-processor] Delivered result for task ${taskId}`);
      } catch (err) {
        // Increment delivery attempts
        recordDeliveryAttempt(taskId, err.message || String(err));
        console.error(`[subagent-processor] Delivery failed for task ${taskId}:`, err);
        // Check if max attempts reached (3)
        if ((delivery.deliveryAttempts || 0) + 1 >= 3) {
          // Mark task as FAILED
          markTaskFailed(taskId, `Delivery failed after 3 attempts: ${err.message || err}`);
          // Send error notification
          const errorMsg = `⚠️ **Delivery Failed**\n\nCould not deliver result for task "${task.contextPacket?.task || taskId}" after 3 attempts.\nPlease check system logs.`;
          try {
            message({ action: 'send', message: errorMsg, target: 'main' });
            // Mark as delivered to stop further retries
            confirmDelivery(taskId);
          } catch (e) {
            console.error('Failed to send error notification:', e);
          }
        }
      }
    }

    // Run maintenance occasionally
    if (Math.random() < 0.2) {
      const maint = maintenance();
      console.log(`[subagent-processor] Maintenance:`, maint);
    }
  } catch (error) {
    console.error('[subagent-processor] Error:', error);
  }
}, 30000); // Every 30 seconds
