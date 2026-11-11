import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverProcess = spawn('node', [path.join(__dirname, 'dist/index.js')], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);

      if (msg.id === 1) {
        // Initialized, now call create_proposal tool
        console.log('\n[1/2] Connected to MCP Server. Calling "create_proposal" tool...');
        serverProcess.stdin.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
              name: 'create_proposal',
              arguments: {
                clientName: 'Nike Innovations Lab',
                scopeOfWork: 'Interactive 3D product showcase and next-gen e-commerce checkout integration.',
                price: 150000,
              },
            },
          }) + '\n'
        );
      } else if (msg.id === 2) {
        console.log('\n[2/2] MCP Server Response:');
        console.log('--------------------------------------------------');
        if (msg.result?.content?.[0]?.text) {
          console.log(msg.result.content[0].text);
        } else {
          console.log(JSON.stringify(msg.result, null, 2));
        }
        console.log('--------------------------------------------------');
        serverProcess.kill();
        process.exit(0);
      }
    } catch {
      // ignore non-json
    }
  }
});

// Initialize
serverProcess.stdin.write(
  JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' },
    },
  }) + '\n'
);

setTimeout(() => {
  console.error('Timed out waiting for response.');
  serverProcess.kill();
  process.exit(1);
}, 6000);

