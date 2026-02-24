/**
 * Initialize and check subagent system
 */
const { init, delegate, status } = require('./dist/index.js');

console.log('Initializing subagent system...');
init();

console.log('\nTesting delegation...');
const { task, response } = delegate(
  'Research best practices for securing Node.js REST APIs',
  { type: 'research-agent', priority: 'HIGH' }
);

console.log('Task created:', task.id);
console.log('\nResponse to user:');
console.log(response);

console.log('\nQueue status:');
const s = status();
console.log(JSON.stringify(s.queue, null, 2));
