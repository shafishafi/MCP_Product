import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import http from 'http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load single common environment file from root workspace (/Users/shafi/prop/.env)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commonEnvPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const envPath of commonEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

// Server Link / Base URL for web dashboard and proposal links
const appBaseUrl =
  process.env.APP_URL ||
  process.env.VITE_APP_URL ||
  'http://localhost:5173';

function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder') &&
    supabaseUrl !== 'https://your-project.supabase.co'
  );
}

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

interface ProposalRecord {
  id: string;
  client_name: string;
  scope_of_work: string;
  price: number;
  status: 'draft' | 'sent' | 'approved';
  created_at: string;
}

function getLocalProposalsFromFile(): ProposalRecord[] {
  const possiblePaths = [
    path.resolve(__dirname, '../../public/mcp-proposals.json'),
    path.resolve(__dirname, '../public/mcp-proposals.json'),
    path.resolve(process.cwd(), 'public/mcp-proposals.json'),
    path.resolve(__dirname, '../local-proposals.json'),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Continue
      }
    }
  }
  return [];
}

// Local file persistence helper for Zero-Config / Demo mode
function saveLocalProposalFile(proposal: ProposalRecord) {
  const possiblePaths = [
    path.resolve(__dirname, '../../public/mcp-proposals.json'),
    path.resolve(__dirname, '../public/mcp-proposals.json'),
    path.resolve(process.cwd(), 'public/mcp-proposals.json'),
    path.resolve(__dirname, '../local-proposals.json'),
  ];

  for (const filePath of possiblePaths) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let existing: ProposalRecord[] = [];
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        try {
          existing = JSON.parse(raw);
        } catch {
          existing = [];
        }
      }
      existing.unshift(proposal);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
      console.error(`[MCP Log] Proposal saved locally to ${filePath}`);
    } catch {
      // Continue to next path
    }
  }
}

// 1. Initialize MCP Server
const server = new McpServer({
  name: 'proposeit-mcp-server',
  version: '1.0.0',
});

// 2. Register `create_proposal` Tool
server.tool(
  'create_proposal',
  'Creates a new client proposal in the Supabase proposals table (or local storage fallback) for ProposeIt.',
  {
    clientName: z.string().describe('The name of the client or company'),
    scopeOfWork: z.string().describe('Detailed scope of work, deliverables, and project milestones'),
    price: z.number().describe('Fixed proposal price in INR (Indian Rupees ₹)'),
  },
  async ({ clientName, scopeOfWork, price }) => {
    try {
      // Validate inputs
      if (!clientName || clientName.trim() === '') {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'Error: clientName parameter cannot be empty.',
            },
          ],
        };
      }

      if (price < 0) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'Error: price parameter cannot be negative.',
            },
          ],
        };
      }

      const client = getSupabaseClient();

      // MODE A: Live Supabase connected
      if (client) {
        const { data, error } = await client
          .from('proposals')
          .insert([
            {
              client_name: clientName.trim(),
              scope_of_work: scopeOfWork.trim(),
              price: price,
              status: 'draft',
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('[MCP Warning] Supabase insert failed, saving to local fallback:', error.message);
          // Fall back to local mode on db error
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Proposal created successfully in Supabase!\n\nID: ${data.id}\nClient: ${data.client_name}\nPrice: ₹${data.price.toLocaleString('en-IN')}\nStatus: ${data.status}\nCreated At: ${data.created_at}\n\nView or edit in your ProposeIt Dashboard at: ${appBaseUrl}/edit/${data.id}`,
              },
            ],
          };
        }
      }

      // MODE B: Local Fallback Mode (Runs without any Supabase credentials!)
      const localId = `prop-mcp-${Date.now().toString(36)}`;
      const localProposal: ProposalRecord = {
        id: localId,
        client_name: clientName.trim(),
        scope_of_work: scopeOfWork.trim(),
        price: price,
        status: 'draft',
        created_at: new Date().toISOString(),
      };

      saveLocalProposalFile(localProposal);

      return {
        content: [
          {
            type: 'text',
            text: `Proposal created successfully in Local Demo Mode (No Supabase required)!\n\nID: ${localProposal.id}\nClient: ${localProposal.client_name}\nPrice: ₹${localProposal.price.toLocaleString('en-IN')}\nStatus: ${localProposal.status}\nCreated At: ${localProposal.created_at}\n\nView or edit in your ProposeIt Dashboard at: ${appBaseUrl}/edit/${localProposal.id}\nPublic Client Link: ${appBaseUrl}/p/${localProposal.id}`,
          },
        ],
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Failed to create proposal: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// 3. Register `list_proposals` Tool
server.tool(
  'list_proposals',
  'Lists recent proposals from the ProposeIt database, optionally filtered by status.',
  {
    status: z
      .enum(['all', 'draft', 'sent', 'approved'])
      .optional()
      .describe('Filter proposals by status'),
    limit: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe('Maximum number of proposals to return (default 20)'),
  },
  async ({ status = 'all', limit = 20 }) => {
    try {
      const client = getSupabaseClient();
      let proposals: ProposalRecord[] = [];

      if (client) {
        let query = client
          .from('proposals')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && data) {
          proposals = data;
        } else {
          proposals = getLocalProposalsFromFile();
        }
      } else {
        proposals = getLocalProposalsFromFile();
        if (status !== 'all') {
          proposals = proposals.filter((p) => p.status === status);
        }
        proposals = proposals.slice(0, limit);
      }

      if (proposals.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No proposals found matching status: "${status}".`,
            },
          ],
        };
      }

      const formatted = proposals
        .map(
          (p, i) =>
            `${i + 1}. [${p.id}] ${p.client_name} - ₹${p.price.toLocaleString('en-IN')} (${p.status.toUpperCase()})\n   Created: ${p.created_at}\n   Link: ${appBaseUrl}/edit/${p.id}`
        )
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${proposals.length} proposal(s):\n\n${formatted}`,
          },
        ],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to list proposals: ${message}` }],
      };
    }
  }
);

// 4. Register `get_proposal` Tool
server.tool(
  'get_proposal',
  'Retrieves the full details of a single proposal by ID from ProposeIt.',
  {
    proposalId: z.string().describe('The ID of the proposal to inspect'),
  },
  async ({ proposalId }) => {
    try {
      const client = getSupabaseClient();
      let proposal: ProposalRecord | null = null;

      if (client) {
        const { data, error } = await client
          .from('proposals')
          .select('*')
          .eq('id', proposalId)
          .single();

        if (!error && data) {
          proposal = data;
        }
      }

      if (!proposal) {
        const local = getLocalProposalsFromFile().find((p) => p.id === proposalId);
        if (local) proposal = local;
      }

      if (!proposal) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Proposal with ID "${proposalId}" not found.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Proposal Details:\n\nID: ${proposal.id}\nClient Name: ${proposal.client_name}\nPrice: ₹${proposal.price.toLocaleString('en-IN')}\nStatus: ${proposal.status}\nCreated At: ${proposal.created_at}\n\nScope of Work:\n${proposal.scope_of_work}\n\nDashboard: ${appBaseUrl}/edit/${proposal.id}\nPublic Client Link: ${appBaseUrl}/p/${proposal.id}`,
          },
        ],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to get proposal: ${message}` }],
      };
    }
  }
);

// 5. Dual Transport Support: HTTP/SSE on Render/Cloud or Stdio for Local CLI
async function startHttpServer(port: number) {
  const transports = new Map<string, SSEServerTransport>();

  const httpServer = http.createServer(async (req, res) => {
    // Enable CORS for web clients & remote agents
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const host = req.headers.host || `localhost:${port}`;
    const url = new URL(req.url || '/', `http://${host}`);

    // Health check endpoint
    if (url.pathname === '/' || url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'ok',
          server: 'proposeit-mcp-server',
          version: '1.0.0',
          mode: isSupabaseConfigured() ? 'Supabase Live' : 'Local Demo Mode',
          sseEndpoint: '/sse',
          messageEndpoint: '/message',
          tools: ['create_proposal', 'list_proposals', 'get_proposal'],
        })
      );
      return;
    }

    // SSE Stream endpoint
    if (url.pathname === '/sse' && req.method === 'GET') {
      try {
        const transport = new SSEServerTransport('/message', res);
        transports.set(transport.sessionId, transport);

        res.on('close', () => {
          transports.delete(transport.sessionId);
        });

        await server.connect(transport);
      } catch (err: unknown) {
        console.error('[SSE Error]', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('SSE initialization failed');
        }
      }
      return;
    }

    // JSON-RPC message endpoint
    if (url.pathname === '/message' && req.method === 'POST') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId || !transports.has(sessionId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session not found or missing sessionId' }));
        return;
      }

      const transport = transports.get(sessionId)!;
      await transport.handlePostMessage(req, res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  httpServer.listen(port, '0.0.0.0', () => {
    console.error(
      `ProposeIt MCP Server running via HTTP/SSE on port ${port} (${
        isSupabaseConfigured() ? 'Connected to Supabase' : 'Local Demo Mode'
      }).`
    );
    console.error(`SSE Endpoint: http://0.0.0.0:${port}/sse`);
  });
}

async function startStdioServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `ProposeIt MCP Server running via stdio transport (${
      isSupabaseConfigured() ? 'Connected to Supabase' : 'Local Demo Mode (No Supabase credentials required)'
    }).`
  );
}

async function main() {
  const isHttp = Boolean(
    process.env.PORT ||
    process.env.RENDER ||
    process.argv.includes('--http') ||
    process.env.MCP_TRANSPORT === 'sse'
  );

  if (isHttp) {
    const port = parseInt(process.env.PORT || '3000', 10);
    await startHttpServer(port);
  } else {
    await startStdioServer();
  }
}

main().catch((error) => {
  console.error('Fatal error in MCP Server:', error);
  process.exit(1);
});
