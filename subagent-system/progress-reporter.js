/**
 * Progress Reporter for Subagents
 *
 * Subagents can call reportProgress(taskId, percent, step) to update their progress.
 * This writes a progress file that is picked up by the main heartbeat process.
 *
 * Usage (from a subagent session):
 *   const { reportProgress } = require('./skills/subagent-system/progress-reporter.js');
 *   reportProgress(taskId, 50, 'Processing data...');
 *
 * Or manually write JSON to memory/subagents/progress/{taskId}.json
 */

const fs = require('fs');
const path = require('path');

// Determine workspace root
const MODULE_DIR = __dirname;
const WORKSPACE_ROOT = path.resolve(MODULE_DIR, '..', '..');
const PROGRESS_DIR = path.join(WORKSPACE_ROOT, 'memory', 'subagents', 'progress');

/**
 * Ensure the progress directory exists
 */
function ensureProgressDir() {
    if (!fs.existsSync(PROGRESS_DIR)) {
        fs.mkdirSync(PROGRESS_DIR, { recursive: true });
    }
}

/**
 * Report progress from a subagent.
 * @param {string} taskId - The task identifier (from contextPacket.taskId)
 * @param {number} percent - Progress percentage (0-100)
 * @param {string} step - Description of current step
 */
function reportProgress(taskId, percent, step) {
    try {
        ensureProgressDir();
        const filePath = path.join(PROGRESS_DIR, `${taskId}.json`);
        const data = {
            taskId,
            timestamp: new Date().toISOString(),
            progress: Math.min(100, Math.max(0, percent)),
            step: step || ''
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('[progress-reporter] Failed to write progress:', error);
    }
}

module.exports = { reportProgress };
