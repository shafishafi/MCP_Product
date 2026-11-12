# ProposeIt: Business Strategy & Product Execution
**The Agentic B2B Deal-Closing Platform Powered by Claude & Model Context Protocol (MCP)**

---

# Page 1: Business Strategy

## 1. Executive Summary & Unique Business Idea

### Concept: The Agentic Proposal & Deal-Closing OS
**ProposeIt** is an agentic, B2B deal-closing operating system purpose-built for independent software engineers, designers, and boutique agencies. 

Unlike traditional proposal software (such as PandaDoc, Proposify, or HoneyBook) that relies on tedious manual document drafting, and unlike generic "AI wrapper" web apps that clutter the browser with hallucinated text boxes, **ProposeIt introduces a radical architecture:**
> **"Zero AI in the Web Codebase; 100% Agentic via the Model Context Protocol (MCP)."**

By providing a dedicated, production-ready **Model Context Protocol (MCP) server**, ProposeIt enables **Claude** (via Claude Desktop, Claude Code, or autonomous sales agents) to directly manage the entire commercial lifecycle of a deal inside the user's natural conversational flow:
1. **Scoping & Estimation**: Claude discusses requirements with the freelancer in chat, formulates milestones, and calculates market-rate pricing.
2. **Instant Headless Creation**: In a single tool call (`create_proposal`), Claude provisions a structured, tamper-proof proposal record in a live Supabase PostgreSQL database.
3. **FinTech-Grade Web UI**: The freelancer and client receive an interactive, mobile-optimized proposal portal featuring dynamic status badges, milestone checklists, one-click digital acceptance, and live dashboard analytics.

---

## 2. The Problem

| Problem Dimension | Current Industry Reality | Impact on Freelancers & Agencies |
| :--- | :--- | :--- |
| **Scoping Friction** | Scoping a project requires translating messy client chats/meeting notes into formal contracts and line-item deliverables. | 10 to 15 hours wasted weekly per freelancer on administrative drafting instead of billable work. |
| **Deal Latency** | Freelancers delay sending proposals by 24–72 hours after discovery calls due to document formatting chores. | **Deal velocity kills close rates.** A 48-hour delay reduces deal closing probability by over 40%. |
| **Clunky SaaS Tools** | Existing proposal tools are heavy, expensive, desktop-unfriendly, and require endless drag-and-drop customization. | Freelancers abandon formal software and resort to unformatted emails or fragile PDFs with zero analytics. |
| **"AI Wrapper" Fatigue** | Generic SaaS apps bolt on a superficial "Generate with AI" button that outputs generic text requiring copy-pasting. | Disconnected from real databases, lacking real-time client state, and requiring manual data entry. |

---

## 3. Target Customers

1. **Independent Software Engineers & Tech Freelancers**:
   - Full-stack developers, mobile app creators, and DevOps consultants billing fixed-price milestones (₹50,000 – ₹5,00,000 / $1,000 – $10,000+).
   - Require structured scopes, milestone gates, and instant mobile-friendly approval links.
2. **Boutique Agencies & Studio Teams (2–20 people)**:
   - Web development agencies, design studios, and growth shops running multiple sales pipelines.
   - Need standardized deliverables, transparent client acceptance, and centralized pipeline tracking.
3. **Fractional CTOs & Specialist Consultants**:
   - Professionals conducting discovery calls in Claude/LLM interfaces who need to turn strategic roadmaps into signed commercial agreements with zero context switching.

---

## 4. Business Model & Monetization

ProposeIt operates on a **Developer-First Product-Led Growth (PLG)** model with a high-conversion freemium funnel:

```
[Claude Desktop / Claude Code User]
                │
                ▼ (Installs free open-source MCP Server)
[Free Tier: Seamless Headless Proposal Creation]
                │
                ▼ (Client views & signs proposal via ProposeIt Portal)
[Viral Exposure: "Powered by ProposeIt" on Client Sign-off Page]
                │
                ▼ (Freelancer hits volume limit or needs team features)
[Upgrades to Paid Pro / Agency Tier]
```

### Monetization Streams:
1. **Tiered Monthly/Annual SaaS Subscriptions**: Paid seats for high-volume pipeline management, custom branding, and webhook integrations.
2. **Embedded Payment Transaction Fee (FinTech Upsell)**: 1% fee on milestone payments and deposits processed directly through the client sign-off page (via Stripe / Razorpay).
3. **Enterprise MCP Workspaces**: Multi-agent orchestration, audit logging, and CRM two-way sync (HubSpot, Salesforce) for agency networks.

---

## 5. Pricing Strategy

| Tier | Price (INR / USD) | Features & Target Audience |
| :--- | :--- | :--- |
| **Starter (Free)** | **₹0 / $0** (Forever) | • Up to 3 active proposals/month<br>• Full Claude MCP Integration (Stdio & SSE)<br>• Live Client Acceptance Portal (`/p/:id`)<br>• Real-time Pipeline Dashboard<br>• Community Support |
| **Pro Freelancer** | **₹1,499 / mo** (~$19/mo) | • **Unlimited proposals** & revision histories<br>• Custom branding & domain (`proposals.yourdomain.com`)<br>• Instant client view notifications (Email & WhatsApp)<br>• PDF export engine & milestone deposit collection<br>• Priority Supabase synchronization |
| **Agency / Studio** | **₹4,999 / mo** (~$59/mo) | • Up to 5 team seats with role-based permissions<br>• Multi-agent MCP orchestration<br>• Client contract e-sign legally binding audit trail<br>• Webhooks & automated invoice generation<br>• Dedicated account manager |

---

## 6. Growth Potential & Defensibility

### 1. Zero-Friction Viral Distribution Loop
Every proposal generated via Claude contains a client-facing review page (`https://propose1it.vercel.app/p/:id`). When high-value founders, restaurant owners, or enterprise managers approve and sign the proposal, they experience the streamlined ProposeIt UI firsthand, driving natural inbound viral adoption among businesses that hire contractors.

### 2. First-Mover Advantage in the Anthropic MCP Ecosystem
As Anthropic rolls out Claude Desktop extensions, Claude for Work, and automated Agent tool directories, ProposeIt stands as the benchmark implementation of **Agent-to-BaaS Commercialization**. Instead of competing in crowded App Stores, ProposeIt captures users where they already think and work: inside their Claude prompt window.

### 3. High Switching Costs (System of Record)
Once a freelancer's active pipeline, client acceptance records, historical scopes, and revenue KPIs are anchored in ProposeIt's database, the platform becomes their permanent commercial source of truth.

---
---

# Page 2: Product Execution

## 1. Live Deployment & MCP Infrastructure Links

| Environment / Service | Live Endpoint / URL | Functionality |
| :--- | :--- | :--- |
| **Production Web Application** | [https://propose1it.vercel.app](https://propose1it.vercel.app) | Real-time React 18 SPA dashboard, proposal editor, and client viewing portal. |
| **Live Cloud MCP Server (SSE)** | `https://mcp-product.onrender.com/sse` | Hosted Server-Sent Events (SSE) MCP bridge for cloud agents and remote Claude clients. |
| **MCP Server Health Monitor** | [https://mcp-product.onrender.com/health](https://mcp-product.onrender.com/health) | Live health check returning `{ status: "ok", mode: "Supabase Live" }`. |
| **Supabase Cloud Database** | Connected PostgreSQL on Supabase | Transactional persistence, Row Level Security, and real-time state synchronization. |
| **Open Source Repository** | GitHub (`main` branch) | Clean, modular codebase separating frontend (`src/`) from backend agent protocol (`mcp-server/`). |

---

## 2. Claude & MCP Integration Architecture

ProposeIt connects directly to Claude via the open standard **Model Context Protocol (MCP)** using both **Local Stdio** (for local CLI/Desktop use) and **Remote SSE** (for hosted cloud agent workflows).

```
 ┌────────────────────────────────────────────────────────┐
 │                      Claude                            │
 │     (Claude Desktop / Claude Code / Autonomous Agent)  │
 └───────────────────────────┬────────────────────────────┘
                             │
                  JSON-RPC 2.0 / MCP Protocol
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │            ProposeIt MCP Server (Node.js)              │
 │  Dual Transport: Stdio (Local) OR HTTP/SSE (Render)    │
 └───────────────────────────┬────────────────────────────┘
                             │
               Direct PostgreSQL / REST Client
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │              Live Supabase Cloud Database              │
 │               Table: proposals (UUID, RLS)             │
 └───────────────────────────┬────────────────────────────┘
                             │
               Reactive Polling & TanStack Query
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │            ProposeIt Frontend (Vercel)                 │
 │  • Dashboard (/): Real-time Metrics & Status Filtering │
 │  • Editor (/edit/:id): Markdown Scoping & Price Adjust │
 │  • Client Portal (/p/:id): 1-Click Digital Approval    │
 └────────────────────────────────────────────────────────┘
```

### Claude Desktop Configuration (`claude_desktop_config.json`)

#### Cloud Hosted SSE Transport (Recommended):
```json
{
  "mcpServers": {
    "proposeit": {
      "url": "https://mcp-product.onrender.com/sse"
    }
  }
}
```

#### Local Subprocess Stdio Transport:
```json
{
  "mcpServers": {
    "proposeit": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "env": {
        "VITE_SUPABASE_URL": "https://your-project.supabase.co",
        "VITE_SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

---

## 3. Product Functionality & Demonstration

### A. The Agentic Creation Experience
A user prompts Claude naturally without leaving their conversation:

> **User Prompt to Claude:**
> *"Draft a ₹50,000 proposal for restaurant for a 3-page website."*

**Claude's Autonomous Execution via MCP Tool Call:**
```json
{
  "name": "create_proposal",
  "arguments": {
    "clientName": "The Royal Dine Restaurant",
    "price": 50000,
    "scopeOfWork": "1. 3-Page Modern Restaurant Website:\n- Homepage & Brand Story: Hero visual banner, chef signature dish highlights, guest reviews, operating hours, and instant reservation CTA.\n- Interactive Digital Menu: Categorized menu sections (Starters, Main Courses, Chef Specials, Beverages & Desserts), dietary badges (Veg, Non-Veg, Vegan, Gluten-Free), and downloadable QR/PDF menu.\n- Reservations, Location & Contact: Online table booking form, embedded Google Maps with directions, WhatsApp direct order trigger, and private event inquiry form.\n\n2. Performance, Conversion & Local SEO:\n- Mobile-first responsive UI built for frictionless phone ordering and table reservations.\n- Local SEO & Restaurant Schema (Schema.org/Restaurant) for Google Maps & search ranking.\n- Fast page speed optimization and SSL security.\n\n3. Phased Milestones & Handover:\n- Week 1: Design concept, content gathering & menu architecture.\n- Week 2: UI development, reservation widget integration, and mobile testing.\n- Week 3: Domain connection, launch to production & client training."
  }
}
```

**MCP Server Response:**
```json
{
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Proposal created successfully in Supabase!\n\nID: 5a1de8a7-2433-4c44-b38a-69bd3ef1f432\nClient: The Royal Dine Restaurant\nPrice: ₹50,000\nStatus: draft\nCreated At: 2026-11-12T02:35:55.46+00:00\n\nView or edit in your ProposeIt Dashboard at: https://propose1it.vercel.app/edit/5a1de8a7-2433-4c44-b38a-69bd3ef1f432"
      }
    ]
  }
}
```

---

### B. Live Product Showcase & Verified Proposal Records

| Client & Project | Value | Live Public Client View | Live Editor / Management Link |
| :--- | :--- | :--- | :--- |
| **The Royal Dine Restaurant** (3-Page Restaurant Website) | **₹50,000** | [View Public Client Portal](https://propose1it.vercel.app/p/5a1de8a7-2433-4c44-b38a-69bd3ef1f432) | [Open in Editor](https://propose1it.vercel.app/edit/5a1de8a7-2433-4c44-b38a-69bd3ef1f432) |
| **Smith Plumbing** (5-Page Commercial Plumbing Website) | **₹1,50,000** | [View Public Client Portal](https://propose1it.vercel.app/p/ef474d08-8af5-408d-a35b-1a21d9c7a5a0) | [Open in Editor](https://propose1it.vercel.app/edit/ef474d08-8af5-408d-a35b-1a21d9c7a5a0) |

---

## 4. The Editing & Management Experience

ProposeIt provides a dual-interface architecture designed for speed, clarity, and conversion:

### 1. Freelancer Pipeline Dashboard (`/`)
- **Real-Time Financial KPIs**: Instant aggregation of Pipeline Value (₹), Approved Revenue (₹), Pending Review deals, and active Drafts.
- **Dynamic Search & Status Filters**: Filter deals instantaneously across `All`, `Approved`, `Sent`, and `Draft`.
- **Sync & Connectivity Controls**: Real-time status indicator showing `DB: Supabase Live` alongside an integrated `MCP Connect` modal with ready-to-copy connection strings.

### 2. The Granular Proposal Editor (`/edit/:id`)
- **Live Form Controls**: Immediate adjustment of client name, fixed pricing in INR (₹), and proposal state (`Draft` ➔ `Sent` ➔ `Approved`).
- **Structured Scope Formulation**: Full-width editing area supporting markdown headings, milestone bullets, payment terms, and delivery timelines.
- **Action Toolbar**: Instant "Copy Client Link" button with automatic clipboard verification, direct navigation to the client-facing view, and deletion safeguard.

### 3. The High-Converting Client Sign-Off Portal (`/p/:id`)
- **Distraction-Free Visual Hierarchy**: Emerald-themed header displaying the contractor identity, issue date, and fixed engagement total.
- **Milestone Transparency**: Clearly formatted deliverables list detailing exactly what is being produced and when.
- **Instant Digital Agreement**: An interactive **"Approve & Sign Proposal"** CTA that triggers real-time celebratory confetti, immediately switches the database status to `Approved`, and records the agreement state across both the client screen and the freelancer dashboard without page reload.

---

## 5. Technical Highlights & Robustness

- **Zero-Latency SPA Routing**: Built on Vite with client-side SPA fallback rules (`vercel.json` rewrites and Netlify redirects) guaranteeing direct URL access to `/p/:id` without 404 errors.
- **Resilient Fallback Storage**: If external network connectivity or database keys are temporarily offline, the MCP server automatically falls back to an embedded JSON store, ensuring proposals are never dropped during an active sales conversation.
- **Security & Portability**: Strict environment variable hygiene with zero hardcoded absolute filesystem paths, ensuring turnkey deployment across any developer machine, Docker container, or cloud host.
