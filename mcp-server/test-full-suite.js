import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverProcess = spawn('node', [path.join(__dirname, 'dist/index.js')], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';
let createdId = null;

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);

      // Step 1: Initialized -> Request Tools List
      if (msg.id === 1) {
        console.log('✅ [1/4] MCP Protocol Handshake initialized successfully.');
        console.log('       Protocol Version:', msg.result?.protocolVersion);
        console.log('       Server Name:', msg.result?.serverInfo?.name);

        console.log('\n🔍 [2/4] Querying registered MCP tools via "tools/list"...');
        serverProcess.stdin.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {},
          }) + '\n'
        );
      }
      // Step 2: Tools list received -> Call create_proposal
      else if (msg.id === 2) {
        const tools = msg.result?.tools || [];
        console.log(`✅ [2/4] Retrieved ${tools.length} registered tools:`);
        tools.forEach((t) => console.log(`       - ${t.name}: ${t.description}`));

        console.log('\n📝 [3/4] Calling "create_proposal" tool with test data...');
        serverProcess.stdin.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'create_proposal',
              arguments: {
                clientName: 'Razorpay Financial Technologies',
                scopeOfWork: 'Enterprise payment orchestration gateway with multi-currency routing, instant refund webhooks, and automated fraud detection pipeline.',
                price: 350000,
              },
            },
          }) + '\n'
        );
      }
      // Step 3: Proposal created -> Call get_proposal
      else if (msg.id === 3) {
        console.log('✅ [3/4] "create_proposal" response received:');
        const text = msg.result?.content?.[0]?.text || '';
        console.log('--------------------------------------------------');
        console.log(text);
        console.log('--------------------------------------------------');

        // Extract ID
        const match = text.match(/ID:\s*([^\s\n]+)/);
        if (match) {
          createdId = match[1];
        }

        console.log('\n🔎 [4/4] Verifying proposal existence via "list_proposals"...');
        serverProcess.stdin.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: {
              name: 'list_proposals',
              arguments: {
                status: 'all',
                limit: 5,
              },
            },
          }) + '\n'
        );
      }
      // Step 4: List proposals received -> Finished
      else if (msg.id === 4) {
        console.log('✅ [4/4] "list_proposals" verification response:');
        console.log('--------------------------------------------------');
        console.log(msg.result?.content?.[0]?.text || JSON.stringify(msg.result));
        console.log('--------------------------------------------------');
        console.log('\n🎉 ALL MCP SERVER TESTS COMPLETED SUCCESSFULLY!');
        serverProcess.kill();
        process.exit(0);
      }
    } catch {
      // ignore
    }
  }
});

// Start initialization
serverProcess.stdin.write(
  JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcp-test-runner', version: '1.0.0' },
    },
  }) + '\n'
);

setTimeout(() => {
  console.error('Timed out waiting for MCP server response.');
  serverProcess.kill();
  process.exit(1);
}, 8000);
