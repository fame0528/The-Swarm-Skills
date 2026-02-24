const path = require('path');

// We're running from the subagent-system directory
const distDir = path.join(__dirname, 'dist');
require('module').Module._initPaths();

// Import the integration module
const integration = require(path.join(distDir, 'integration.js'));

// Call onHeartbeat to process the queue
const result = integration.onHeartbeat();

// Output as JSON for the main agent to parse
console.log(JSON.stringify(result, null, 2));
