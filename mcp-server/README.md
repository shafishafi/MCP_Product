# ProposeIt MCP Server

A specialized [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that allows external AI assistants (like Claude, Cursor, or CLI agents) to generate project proposals directly into the ProposeIt Supabase database without any AI keys or models in the core application codebase.

## Architectural Boundary

```
[ External LLM Agent (Claude Desktop / Cursor) ]
                     │
                     ▼ (stdio JSON-RPC)
            [ ProposeIt MCP Server ]
                     │
                     ▼ (inserts row)
          [ Supabase Database ]
                     │
                     ▼ (real-time / queries)
     [ ProposeIt React Frontend (AI-Free) ]
```

## Tools Provided

### `create_proposal`
Inserts a new project proposal into the `proposals` table.

- **Parameters:**
  - `clientName` (string): Name of the client or organization.
  - `scopeOfWork` (string): Detailed breakdown of milestones, deliverables, and project scope.
  - `price` (number): Proposed fixed-fee investment in USD.

- **Returns:**
  The generated Supabase record ID, proposal summary, and direct link to edit or view the proposal in ProposeIt.

## Getting Started

### 1. Installation & Build
```bash
cd mcp-server
npm install
npm run build
```

### 2. Environment Variables
Copy `.env.example` to `.env` and set your Supabase credentials:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-key
```

### 3. Usage with Claude Desktop
Add the following to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "proposeit": {
      "command": "node",
      "args": ["/absolute/path/to/prop/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-key"
      }
    }
  }
}
```

