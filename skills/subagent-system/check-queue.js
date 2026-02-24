/**
 * Quick queue status checker
 * Run: node check-queue.js
 */

const path = require('path');
const fs = require('fs');

const baseDir = __dirname;
const queueFile = path.join(baseDir, 'task-queue.json');
const resultsDir = path.join(baseDir, 'results');

console.log('🔄 Subagent Queue Status\n');

if (!fs.existsSync(queueFile)) {
  console.log('Queue not initialized yet.');
  console.log('Run: node dist/integration.js or delegate a task first.');
  process.exit(0);
}

const queue = JSON.parse(fs.readFileSync(queueFile, 'utf-8'));

// Count by status
const byStatus = {
  PENDING: 0,
  RUNNING: 0,
  COMPLETED: 0,
  FAILED: 0,
  ABANDONED: 0
};

queue.tasks.forEach(t => {
  byStatus[t.status] = (byStatus[t.status] || 0) + 1;
});

console.log('Queue:');
console.log(`  Pending:   ${byStatus.PENDING}`);
console.log(`  Running:   ${byStatus.RUNNING}`);
console.log(`  Completed: ${byStatus.COMPLETED}`);
console.log(`  Failed:    ${byStatus.FAILED}`);
console.log(`  Abandoned: ${byStatus.ABANDONED}`);
console.log();

console.log('Stats:');
console.log(`  Total Enqueued: ${queue.stats.totalEnqueued}`);
console.log(`  Total Completed: ${queue.stats.totalCompleted}`);
console.log(`  Total Failed: ${queue.stats.totalFailed}`);
console.log();

// Check for undelivered results
if (fs.existsSync(resultsDir)) {
  const results = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
  let undelivered = 0;
  results.forEach(f => {
    const result = JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf-8'));
    if (!result.delivered) undelivered++;
  });
  console.log(`Results: ${results.length} total, ${undelivered} undelivered`);
}

// Health assessment
const health = queue.tasks.length < 40 ? 'healthy' : 
               queue.tasks.length < 50 ? 'busy' : 'overloaded';
console.log(`\nHealth: ${health}`);

// Show oldest pending task
const pending = queue.tasks.filter(t => t.status === 'PENDING');
if (pending.length > 0) {
  pending.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const oldest = pending[0];
  const age = Math.round((Date.now() - new Date(oldest.createdAt).getTime()) / 60000);
  console.log(`\nOldest Pending: ${oldest.id} (${age}min ago)`);
  console.log(`  Task: ${oldest.contextPacket.task.substring(0, 60)}...`);
}
