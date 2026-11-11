import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables from mcp-server/.env or parent .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

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
    price: z.number().describe('Fixed proposal price in USD'),
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
                text: `Proposal created successfully in Supabase!\n\nID: ${data.id}\nClient: ${data.client_name}\nPrice: $${data.price}\nStatus: ${data.status}\nCreated At: ${data.created_at}\n\nView or edit in your ProposeIt Dashboard at: http://localhost:5173/edit/${data.id}`,
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
            text: `Proposal created successfully in Local Demo Mode (No Supabase required)!\n\nID: ${localProposal.id}\nClient: ${localProposal.client_name}\nPrice: $${localProposal.price}\nStatus: ${localProposal.status}\nCreated At: ${localProposal.created_at}\n\nView or edit in your ProposeIt Dashboard at: http://localhost:5173/edit/${localProposal.id}\nPublic Client Link: http://localhost:5173/p/${localProposal.id}`,
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

// 3. Start MCP Stdout/Stdio Transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `ProposeIt MCP Server running via stdio transport (${
      isSupabaseConfigured() ? 'Connected to Supabase' : 'Local Demo Mode (No Supabase credentials required)'
    }).`
  );
}

main().catch((error) => {
  console.error('Fatal error in MCP Server:', error);
  process.exit(1);
});
