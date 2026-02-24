/**
 * Enhanced Subagent Integration with Activity Logging & Visibility
 * 
 * This module wraps the core subagent system to add:
 * - Activity logging (spawned, started, heartbeat, completed, failed, error)
 * - Enhanced memory tracking (sessions, lastHeartbeat, currentStep, progress)
 * - Heartbeat reporting every 30 seconds
 */

const { 
  init: initCore, 
  processQueue, 
  recordSpawn, 
  onSubagentComplete,
  getStatus: getCoreStatus,
  maintenance: coreMaintenance
} = require('./dist/integration.js');

const activityLog = require('./activity-log');
const memoryManager = require('./memory-manager');

// Initialize on startup
let initialized = false;
let heartbeatInterval = null;
const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
const STALE_THRESHOLD_MS = 120000; // 2 minutes

/**
 * Initialize the enhanced subagent system
 */
function init() {
  if (initialized) return;
  
  initCore();
  console.log('[enhanced-subagent] Initialized with activity logging');
  
  // Start heartbeat reporter
  startHeartbeatReporter();
  
  initialized = true;
}

/**
 * Start the heartbeat reporter
 * Runs in background to write periodic heartbeats for running tasks
 */
function startHeartbeatReporter() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  heartbeatInterval = setInterval(() => {
    try {
      reportHeartbeats();
    } catch (error) {
      console.error('[enhanced-subagent] Heartbeat error:', error);
    }
  }, HEARTBEAT_INTERVAL_MS);
  
  console.log('[enhanced-subagent] Heartbeat reporter started (every 30s)');
}

/**
 * Report heartbeats for all running tasks
 */
function reportHeartbeats() {
  const status = getCoreStatus();
  const { queue } = status;
  
  if (!queue || !queue.tasks) return;
  
  const runningTasks = queue.tasks.filter(t => t.status === 'RUNNING');
  
  for (const task of runningTasks) {
    try {
      const profileId = task.contextPacket?.agentId || task.type || 'general';
      const taskId = task.id;
      const elapsedMs = Date.now() - new Date(task.startedAt).getTime();
      
      // Write heartbeat activity entry
      activityLog.writeActivityEntry({
        taskId,
        profileId,
        action: 'heartbeat',
        details: `Running for ${formatDuration(elapsedMs)}`,
        currentStep: 'Processing...', // Could be enhanced later with subagent-reported progress
        progress: 0
      });
      
      // Update memory with heartbeat timestamp
      memoryManager.recordHeartbeat(
        profileId,
        taskId,
        'Processing...',
        0,
        null // memory usage not tracked yet
      );
      
    } catch (error) {
      console.error(`[enhanced-subagent] Failed to report heartbeat for task ${task.id}:`, error);
    }
  }
}

/**
 * Format duration in human-readable form
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/**
 * Enhanced processQueue that logs spawned tasks
 * Should be called during heartbeat
 * Returns tasks that are ready to be spawned
 */
function processQueueWithLogging() {
  const toSpawn = processQueue();
  
  for (const { task, prompt, spawnOptions } of toSpawn) {
    const profileId = task.contextPacket?.agentId || task.type || 'general';
    const taskId = task.id;
    
    // Create enhanced memory session (PENDING initially)
    memoryManager.createSession(
      profileId,
      taskId,
      task.contextPacket?.task || task.contextPacket?.taskDescription || 'No description'
    );
    
    // Write 'spawned' activity entry (task queued for spawning)
    activityLog.writeActivityEntry({
      taskId,
      profileId,
      action: 'spawned',
      details: task.contextPacket?.task || 'Task spawned'
    });
  }
  
  return toSpawn;
}

/**
 * Call this after successful sessions_spawn to mark task as started
 */
function onTaskStarted(taskId, sessionId) {
  // Get task info to determine profileId
  const tasks = require('./dist/queue.js').getTask(taskId);
  if (!tasks) return;
  
  const profileId = tasks.contextPacket?.agentId || tasks.type || 'general';
  const now = new Date().toISOString();
  
  // Write 'started' activity entry
  activityLog.writeActivityEntry({
    taskId,
    profileId,
    action: 'started',
    details: 'Subagent session started'
  });
  
  // Update memory: session status and top-level lastHeartbeat
  const memory = memoryManager.readMemory(profileId);
  // Update session
  memoryManager.updateSession(profileId, taskId, { 
    status: 'RUNNING'
  });
  // Also set top-level lastHeartbeat and currentStep
  memory.lastHeartbeat = now;
  memory.currentStep = 'Starting...';
  memory.progress = 0;
  memoryManager.writeMemory(profileId, memory);
}

/**
 * Enhanced onSubagentComplete that logs completion/failure
 */
function onSubagentComplete(sessionId, taskId, success, result, error) {
  // Get task info to determine profileId
  const status = getCoreStatus();
  const task = status.queue?.tasks?.find(t => t.id === taskId);
  const profileId = task?.contextPacket?.agentId || task?.type || 'general';
  
  if (success && result) {
    // Write completed activity entry
    const duration = task?.startedAt 
      ? Date.now() - new Date(task.startedAt).getTime()
      : 0;
    
    activityLog.writeActivityEntry({
      taskId,
      profileId,
      action: 'completed',
      details: `Completed in ${formatDuration(duration)}`
    });
    
    // Complete memory session
    memoryManager.completeSession(profileId, taskId, result);
    
    // Record completion in core system
    onSubagentComplete(sessionId, taskId, success, result, error);
  } else if (error) {
    // Write failed activity entry
    activityLog.writeActivityEntry({
      taskId,
      profileId,
      action: 'failed',
      details: error.message || String(error),
      error: error.message || String(error),
      stackTrace: error.stack
    });
    
    // Fail memory session
    memoryManager.failSession(profileId, taskId, error);
    
    // Record failure in core system
    onSubagentComplete(sessionId, taskId, success, result, error);
  }
}

/**
 * Get enhanced status with activity and heartbeat info
 */
function getEnhancedStatus() {
  const coreStatus = getCoreStatus();
  const recentActivity = activityLog.getRecentActivity(20);
  const statsByProfile = {};
  
  // Get stats for all profiles
  const profiles = [
    'researcher', 'coder', 'security', 'general', 'visionary',
    'project-manager', 'optimizer', 'growth-hacker', 'writer',
    'designer', 'analyst', 'community-manager', 'qa-tester'
  ];
  
  for (const profileId of profiles) {
    statsByProfile[profileId] = memoryManager.getStats(profileId);
  }
  
  // Enhance tasks with heartbeat/stale info
  const enhancedTasks = (coreStatus.queue?.tasks || []).map(task => {
    const profileId = task.contextPacket?.agentId || task.type || 'general';
    const memData = memoryManager.readMemory(profileId);
    const session = memData.sessions.find(s => s.taskId === task.id);
    
    const lastHeartbeat = task.subagentSessionId && session?.lastHeartbeat 
      ? session.lastHeartbeat 
      : task.startedAt;
    
    const isStale = task.status === 'RUNNING' && lastHeartbeat &&
      (Date.now() - new Date(lastHeartbeat).getTime()) > STALE_THRESHOLD_MS;
    
    return {
      ...task,
      lastHeartbeat,
      isStale,
      currentStep: memData.currentStep,
      progress: memData.progress
    };
  });
  
  return {
    ...coreStatus,
    tasks: enhancedTasks,
    activityLog: recentActivity,
    memoryStats: statsByProfile,
    queueHealth: {
      ...coreStatus.queue,
      pendingOlderThan2min: coreStatus.queue?.oldestPending &&
        (Date.now() - new Date(coreStatus.queue.oldestPending).getTime()) > 120000
    }
  };
}

/**
 * Run maintenance with enhanced logging
 */
function maintenance() {
  const result = coreMaintenance();
  
  // Log maintenance activity
  activityLog.writeActivityEntry({
    taskId: 'system',
    profileId: 'system',
    action: 'maintenance',
    details: `Cleaned ${result.tasksRemoved} tasks, delivered ${result.resultsDelivered} results, recovered ${result.zombiesRecovered} zombies`
  });
  
  return result;
}

/**
 * Clear activity log
 */
function clearLog() {
  activityLog.clearActivityLog();
  console.log('[enhanced-subagent] Activity log cleared');
}

// Export enhanced functions
module.exports = {
  init,
  processQueue: processQueueWithLogging,
  recordSpawn,
  onSubagentComplete,
  onTaskStarted,
  getStatus: getEnhancedStatus,
  maintenance,
  clearLog,
  
  // Also expose raw utilities for debugging
  _activityLog: activityLog,
  _memoryManager: memoryManager
};
