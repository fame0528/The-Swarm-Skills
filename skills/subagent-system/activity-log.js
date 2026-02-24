/**
 * Activity Log utilities for subagents
 * Provides functions to write activity entries to the shared log
 */

const fs = require('fs');
const path = require('path');

// Determine base paths
// This module is in skills/subagent-system, so go up to workspace root
const MODULE_DIR = __dirname;
const WORKSPACE_ROOT = path.resolve(MODULE_DIR, '..', '..');
const ACTIVITY_LOG_PATH = path.join(WORKSPACE_ROOT, 'memory', 'subagents', 'activity-log.json');
const MAX_ENTRIES = 100;

/**
 * Read the current activity log
 */
function readActivityLog() {
  try {
    if (!fs.existsSync(ACTIVITY_LOG_PATH)) {
      return { version: '1.0.0', entries: [] };
    }
    const content = fs.readFileSync(ACTIVITY_LOG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('[activity-log] Failed to read log:', error);
    return { version: '1.0.0', entries: [] };
  }
}

/**
 * Write an activity entry to the log
 * @param {Object} entry - The activity entry
 * @param {string} entry.taskId - Task identifier
 * @param {string} entry.profileId - Profile identifier
 * @param {string} entry.action - Action type: spawned, started, heartbeat, completed, failed, error
 * @param {string} entry.details - Brief description of the action
 * @param {string} [entry.currentStep] - Current step (for heartbeat)
 * @param {number} [entry.progress] - Progress percentage 0-100 (for heartbeat)
 * @param {string} [entry.error] - Error message (for failed/error actions)
 * @param {string} [entry.stackTrace] - Stack trace (for errors)
 */
function writeActivityEntry(entry) {
  try {
    const log = readActivityLog();
    
    const newEntry = {
      timestamp: new Date().toISOString(),
      taskId: entry.taskId,
      profileId: entry.profileId,
      action: entry.action,
      details: entry.details || '',
      ...(entry.currentStep && { currentStep: entry.currentStep }),
      ...(entry.progress !== undefined && { progress: entry.progress }),
      ...(entry.error && { error: entry.error }),
      ...(entry.stackTrace && { stackTrace: entry.stackTrace })
    };

    // Add to entries array (newest first)
    log.entries.unshift(newEntry);

    // Trim to max entries (ring buffer)
    if (log.entries.length > MAX_ENTRIES) {
      log.entries = log.entries.slice(0, MAX_ENTRIES);
    }

    // Write back to file
    fs.writeFileSync(ACTIVITY_LOG_PATH, JSON.stringify(log, null, 2));
    
    return true;
  } catch (error) {
    console.error('[activity-log] Failed to write entry:', error);
    return false;
  }
}

/**
 * Get recent activity entries
 * @param {number} limit - Maximum number of entries to return
 * @returns {Array} Recent activity entries (newest first)
 */
function getRecentActivity(limit = 20) {
  const log = readActivityLog();
  return log.entries.slice(0, limit);
}

/**
 * Get activity for a specific task
 * @param {string} taskId - Task identifier
 * @returns {Array} Activity entries for the task
 */
function getTaskActivity(taskId) {
  const log = readActivityLog();
  return log.entries.filter(entry => entry.taskId === taskId);
}

/**
 * Clear all activity logs
 */
function clearActivityLog() {
  try {
    const emptyLog = { version: '1.0.0', entries: [] };
    fs.writeFileSync(ACTIVITY_LOG_PATH, JSON.stringify(emptyLog, null, 2));
    return true;
  } catch (error) {
    console.error('[activity-log] Failed to clear log:', error);
    return false;
  }
}

/**
 * Check if a task has heartbeat activity
 * @param {string} taskId - Task identifier
 * @param {number} maxAgeSeconds - Maximum age for heartbeat to be considered fresh
 * @returns {boolean} True if heartbeat is recent
 */
function hasRecentHeartbeat(taskId, maxAgeSeconds = 120) {
  const entries = getTaskActivity(taskId);
  const heartbeats = entries.filter(e => e.action === 'heartbeat');
  
  if (heartbeats.length === 0) {
    return false;
  }
  
  const latest = heartbeats[0]; // Newest first
  const ageSeconds = (Date.now() - new Date(latest.timestamp).getTime()) / 1000;
  return ageSeconds <= maxAgeSeconds;
}

module.exports = {
  writeActivityEntry,
  getRecentActivity,
  getTaskActivity,
  clearActivityLog,
  hasRecentHeartbeat
};
