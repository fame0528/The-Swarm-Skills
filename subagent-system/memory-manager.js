/**
 * Enhanced memory management for subagents
 * Tracks sessions, heartbeats, progress, and steps
 */

const fs = require('fs');
const path = require('path');

// Determine base paths
const MODULE_DIR = __dirname;
const WORKSPACE_ROOT = path.resolve(MODULE_DIR, '..', '..');

/**
 * Get the memory file path for a profile
 */
function getMemoryPath(profileId) {
  return path.join(WORKSPACE_ROOT, 'memory', 'subagents', `${profileId}.json`);
}

/**
 * Read memory data for a profile
 */
function readMemory(profileId) {
  try {
    const memoryPath = getMemoryPath(profileId);
    if (!fs.existsSync(memoryPath)) {
      // Initialize new memory file
      return {
        profileId,
        sessions: [],
        lastHeartbeat: null,
        currentStep: null,
        progress: 0,
        stats: { totalSessions: 0, completed: 0, failed: 0, running: 0, avgDuration: 0 }
      };
    }
    const content = fs.readFileSync(memoryPath, 'utf-8');
    let data = JSON.parse(content);

    // Migration: handle old format { "memory": { "sessions": [] }, "stats": {} }
    if (data.memory && !data.sessions) {
      console.log(`[memory] Migrating old format for ${profileId}`);
      data.sessions = data.memory.sessions || [];
      delete data.memory;
    }

    // Ensure all required fields exist
    if (!data.sessions) data.sessions = [];
    if (!data.lastHeartbeat) data.lastHeartbeat = null;
    if (!data.currentStep) data.currentStep = null;
    if (data.progress === undefined) data.progress = 0;
    if (!data.stats) data.stats = { totalSessions: 0, completed: 0, failed: 0, running: 0, avgDuration: 0 };
    if (data.stats.totalSessions === undefined) data.stats.totalSessions = data.sessions.length;

    return data;
  } catch (error) {
    console.error(`[memory] Failed to read memory for ${profileId}:`, error);
    return {
      profileId,
      sessions: [],
      lastHeartbeat: null,
      currentStep: null,
      progress: 0,
      stats: { totalSessions: 0, completed: 0, failed: 0, running: 0, avgDuration: 0 }
    };
  }
}

/**
 * Write memory data for a profile
 */
function writeMemory(profileId, data) {
  try {
    const memoryPath = getMemoryPath(profileId);
    fs.writeFileSync(memoryPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`[memory] Failed to write memory for ${profileId}:`, error);
    return false;
  }
}

/**
 * Create a new session entry
 */
function createSession(profileId, taskId, description) {
  const memory = readMemory(profileId);

  const session = {
    taskId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    description,
    status: 'RUNNING'
  };

  memory.sessions.push(session);
  memory.currentStep = 'Starting...';
  memory.progress = 0;

  writeMemory(profileId, memory);
  return session;
}

/**
 * Update session status
 */
function updateSession(profileId, taskId, updates) {
  const memory = readMemory(profileId);

  const session = memory.sessions.find(s => s.taskId === taskId);
  if (session) {
    Object.assign(session, updates);
    writeMemory(profileId, memory);
  }

  return memory;
}

/**
 * Complete a session
 */
function completeSession(profileId, taskId, result) {
  const memory = updateSession(profileId, taskId, { 
    completedAt: new Date().toISOString(),
    status: 'COMPLETED',
    result
  });
  // Update stats
  memory.stats = getStats(profileId);
  writeMemory(profileId, memory);
  return memory;
}

/**
 * Fail a session
 */
function failSession(profileId, taskId, error) {
  const memory = updateSession(profileId, taskId, { 
    completedAt: new Date().toISOString(),
    status: 'FAILED',
    error
  });
  // Update stats
  memory.stats = getStats(profileId);
  writeMemory(profileId, memory);
  return memory;
}

/**
 * Record a heartbeat
 */
function recordHeartbeat(profileId, taskId, step, progress, memoryUsage) {
  const memory = readMemory(profileId);

  memory.lastHeartbeat = new Date().toISOString();
  memory.currentStep = step;
  memory.progress = progress || 0;

  // Also update the specific session
  const session = memory.sessions.find(s => s.taskId === taskId);
  if (session) {
    session.lastHeartbeat = memory.lastHeartbeat;
    session.currentStep = step;
    session.progress = progress;
    if (memoryUsage) {
      session.memoryUsage = memoryUsage;
    }
  }

  writeMemory(profileId, memory);
  return memory;
}

/**
 * Get active sessions (running tasks)
 */
function getActiveSessions(profileId) {
  const memory = readMemory(profileId);
  return memory.sessions.filter(s => s.status === 'RUNNING');
}

/**
 * Get session statistics
 */
function getStats(profileId) {
  const memory = readMemory(profileId);
  const sessions = memory.sessions;

  const totalSessions = sessions.length;
  const completed = sessions.filter(s => s.status === 'COMPLETED').length;
  const failed = sessions.filter(s => s.status === 'FAILED').length;
  const running = sessions.filter(s => s.status === 'RUNNING').length;

  const completedSessions = sessions.filter(s => s.completedAt && s.startedAt);
  const avgDuration = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()), 0) / completedSessions.length
    : 0;

  return { totalSessions, completed, failed, running, avgDuration };
}

module.exports = {
  getMemoryPath,
  readMemory,
  writeMemory,
  createSession,
  updateSession,
  completeSession,
  failSession,
  recordHeartbeat,
  getActiveSessions,
  getStats
};
