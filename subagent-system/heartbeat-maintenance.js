const queue = require('./dist/queue.js');

// Initialize
queue.initQueue();

// Zombie recovery
const zombiesRecovered = queue.recoverZombieTasks();
console.log('Zombies recovered:', zombiesRecovered);

// Cleanup old tasks
const tasksRemoved = queue.cleanupOldTasks();
console.log('Tasks cleaned up:', tasksRemoved);

// Status check
const status = queue.getQueueStatus();
console.log('Queue status:', JSON.stringify(status, null, 2));
