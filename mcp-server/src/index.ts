import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
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

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      throw new Error(
        'Supabase is not configured. Please supply valid SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) environment variables in .env'
      );
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

// 1. Initialize MCP Server
const server = new McpServer({
  name: 'proposeit-mcp-server',
  version: '1.0.0',
});

// 2. Register `create_proposal` Tool
server.tool(
  'create_proposal',
  'Creates a new client proposal in the Supabase proposals table for ProposeIt.',
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

      // Insert new row into proposals table
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
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Supabase database error: ${error.message} (code: ${error.code || 'UNKNOWN'})`,
            },
          ],
        };
      }

      const proposalId = data.id;

      return {
        content: [
          {
            type: 'text',
            text: `Proposal created successfully!\n\nID: ${proposalId}\nClient: ${data.client_name}\nPrice: $${data.price}\nStatus: ${data.status}\nCreated At: ${data.created_at}\n\nView or edit in ProposeIt Dashboard at: /edit/${proposalId}`,
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
  // Log to stderr only so stdout remains clean for MCP JSON-RPC protocol
  console.error('ProposeIt MCP Server running via stdio transport.');
}

main().catch((error) => {
  console.error('Fatal error in MCP Server:', error);
  process.exit(1);
});

