# ProposeIt - B2B Freelancer Proposal SaaS

**ProposeIt** is a fast, elegant B2B proposal management portal designed specifically for independent freelancers and boutique agencies.

> **CRITICAL ARCHITECTURE NOTE:** This application contains **ZERO AI integrations** inside the web codebase. It serves strictly as a high-performance UI and Supabase client. Proposal generation from AI workflows happens externally through the dedicated Model Context Protocol (MCP) server.

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS & Shadcn UI (Styled to the Emerald FinTech design system in `DESIGN.md`)
- **Typography**: Plus Jakarta Sans
- **Routing**: TanStack Router (File/Code-based routing)
- **Data Fetching / Cache**: TanStack Query
- **Client State**: Zustand
- **Database / BaaS**: Supabase
- **External Integration**: Model Context Protocol (MCP) Node.js Server

---

## Project Structure

```
prop/
├── DESIGN.md                   # Visual design system specifications
├── src/
│   ├── components/
│   │   ├── layout/Navbar.tsx   # Top application navigation bar
│   │   ├── proposals/          # Proposal modals and forms
│   │   └── ui/                 # Shadcn UI primitives (Button, Card, Table, Badge, etc.)
│   ├── lib/
│   │   ├── queryClient.ts      # TanStack Query client configuration
│   │   ├── supabase.ts         # Supabase client + fallback mock dataset
│   │   └── utils.ts            # Formatting & Tailwind cn helpers
│   ├── pages/
│   │   ├── DashboardPage.tsx   # / - Data table, KPI metrics, filters
│   │   ├── EditorPage.tsx      # /edit/$proposalId - Proposal edit form
│   │   └── PublicViewPage.tsx  # /p/$proposalId - Client agreement & approval page
│   ├── routes/
│   │   └── router.tsx          # TanStack Router route tree & root layout
│   ├── store/
│   │   └── uiStore.ts          # Zustand store for toast alerts & filters
│   └── types/
│       └── proposal.ts         # Proposal TypeScript interfaces
├── supabase/
│   └── schema.sql              # Supabase table schema and RLS policies
└── mcp-server/                 # Separate MCP Server package
    ├── src/index.ts            # MCP Stdout server with create_proposal tool
    └── dist/                   # Compiled MCP server
```

---

## Quickstart

### 1. Frontend Development Server

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

### 2. Configure Supabase (Optional)
By default, the application runs in interactive mock mode with preloaded demo proposals. To connect a live Supabase instance:
1. Run `supabase/schema.sql` in your Supabase SQL Editor.
2. Add your credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Running the MCP Server

```bash
cd mcp-server
npm install
npm run build
npm start
```

