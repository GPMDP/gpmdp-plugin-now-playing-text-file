const path = require('path');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5672');

ws.on('open', () => {
  console.log('Installing Plugin through WebSocket');

  ws.send(JSON.stringify({
    namespace: 'plugin',
    method: 'install',
    arguments: [path.resolve(__dirname, 'dist.js')],
  }));
  setTimeout(() => {
    process.exit(0);
  }, 100);
});
