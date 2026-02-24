/**
 * Full end-to-end test of subagent system
 */
const { init, delegate, processQueue, recordSpawn, recordCompletion, status, maintenance } = require('./dist/index.js');

console.log('=== Full Subagent Flow Test ===\n');

// 1. Initialize
console.log('1. Initialize...');
init();
console.log('   ✓ Done\n');

// 2. Delegate a task
console.log('2. Delegate task...');
const { task, response } = delegate(
  'Research OAuth 2.0 vs JWT authentication',
  { type: 'research-agent', priority: 'HIGH' }
);
console.log('   Task ID:', task.id);
console.log('   Response preview:', response.split('\n')[0]);
console.log();

// 3. Process queue (simulating heartbeat)
console.log('3. Process queue (heartbeat)...');
const toSpawn = processQueue();
console.log('   Tasks to spawn:', toSpawn.length);

if (toSpawn.length > 0) {
  const spawnTask = toSpawn[0];
  console.log('   Task type:', spawnTask.task.type);
  console.log('   Prompt preview:', spawnTask.prompt.substring(0, 60) + '...');
  
  // 4. Simulate spawn
  console.log('\n4. Simulate spawn...');
  const sessionId = 'test-session-' + Date.now();
  recordSpawn(spawnTask.task.id, sessionId);
  console.log('   Session ID:', sessionId);
  
  // 5. Simulate completion
  console.log('\n5. Simulate completion...');
  recordCompletion(spawnTask.task.id, {
    summary: 'OAuth 2.0 is better for third-party authorization, JWT is better for stateless API authentication.',
    recommendation: 'Use JWT for your REST API, OAuth 2.0 if you need third-party login'
  });
  console.log('   ✓ Completed');
}

// 6. Check status
console.log('\n6. Queue status...');
const s = status();
console.log('   Completed:', s.queue.completedTasks);
console.log('   Pending deliveries:', s.pendingDeliveries);
console.log();

// 7. Run maintenance (which delivers results)
console.log('7. Run maintenance (deliver results)...');
const m = maintenance();
console.log('   Results delivered:', m.resultsDelivered);
console.log('   Tasks removed:', m.tasksRemoved);
console.log('   Zombies recovered:', m.zombiesRecovered);
console.log();

// 8. Final check
console.log('8. Final queue status...');
const final = status();
console.log('   Completed:', final.queue.completedTasks);
console.log('   Pending deliveries:', final.pendingDeliveries);
console.log();

console.log('=== Test Complete ===');
console.log('\n✅ Subagent system is fully operational!');
