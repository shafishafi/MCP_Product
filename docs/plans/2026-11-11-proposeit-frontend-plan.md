# ProposeIt MVP Frontend - Implementation Plan

> **Goal:** Build the complete frontend for "ProposeIt", a B2B SaaS for freelancers to manage project proposals, adhering strictly to `DESIGN.md` (Emerald FinTech design system), TanStack Router, TanStack Query, Zustand, Shadcn UI, and Supabase.
>
> **CRITICAL RULE:** ZERO AI integrations in the codebase. UI & Database only. External data generation will occur via the MCP server in Step 5.

---

## 1. Overview & Architecture

ProposeIt is a specialized B2B proposal management portal for independent contractors and freelancers. It provides:
1. **Dashboard (`/`)**: Financial metrics overview, quick filters, and a Shadcn data table listing all proposals (Client Name, Price, Status, Date, Edit action, View Public action).
2. **Editor (`/edit/$proposalId`)**: Proposal detail editor with Client Name, Scope of Work, Price, and Status transitions, wired to TanStack Query mutations.
3. **Public Client View (`/p/$proposalId`)**: A client-facing read-only view with high-trust design tokens, scope breakdown, pricing card, and proposal acceptance flow.

### Design System Integration (`DESIGN.md`):
- **Colors**: Deep Emerald (`#006A4E`, `#00503a`), kelly green (`#00875A`), mint containers (`#D1FAE5`), surface canvas (`#F8FAFC`), crisp white cards (`#FFFFFF`), neutral borders (`#E5E7EB`).
- **Typography**: Plus Jakarta Sans throughout for clean fintech/financial legibility.
- **Card Geometry & Elevation**: `rounded-2xl` containers, `rounded-xl` interactive buttons/inputs, `rounded-full` status badges (`draft`, `sent`, `approved`).

---

## 2. Phased Execution Tasks

### Phase 1: Vite + React + TS Scaffolding & Dependencies
- Initialize Vite React TS application directly in the workspace.
- Install required dependencies:
  - `@tanstack/react-router`, `@tanstack/react-query`
  - `zustand`
  - `@supabase/supabase-js`
  - `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`
  - Tailwind CSS, PostCSS, Autoprefixer
- Configure `tsconfig.json` with `@/*` path aliases.
- Configure Tailwind CSS with the colors, fonts, and radii from `DESIGN.md`.
- Configure Google Font (Plus Jakarta Sans) in `index.html`.

### Phase 2: Core Infrastructure, State & Types
- **Types (`src/types/proposal.ts`)**:
  - `Proposal` interface:
    ```typescript
    export type ProposalStatus = 'draft' | 'sent' | 'approved';

    export interface Proposal {
      id: string;
      client_name: string;
      scope_of_work: string;
      price: number;
      status: ProposalStatus;
      created_at: string;
    }
    ```
- **Supabase Client (`src/lib/supabase.ts`)**:
  - Initialized with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - Includes a fallback mock database provider with persistent initial demo proposals so the application is fully interactive and testable out of the box even before real Supabase keys are provided.
- **Query Client (`src/lib/queryClient.ts`)**:
  - TanStack Query client configuration with stale time & retry strategies.
- **Zustand Store (`src/store/uiStore.ts`)**:
  - Global toast notification queue (`toasts`, `addToast`, `removeToast`).
  - Active UI states (sidebar toggle, filter state).

### Phase 3: Shadcn UI Component Primitives
- Create reusable design-token compliant components in `src/components/ui/`:
  - `Button` (with emerald primary `#006A4E`, secondary outline, ghost, destructive)
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell`
  - `Badge` (with variants for `draft`, `sent`, `approved`)
  - `Input` & `Textarea`
  - `Toast` notification container component

### Phase 4: TanStack Router & Route Views
- Set up TanStack Router with code-based route definitions for reliability:
  - **Root Layout (`src/routes/__root.tsx`)**: Global Navbar with ProposeIt branding (Emerald badge, currency icon), navigation links, Toast container, and outlet.
  - **Dashboard Route (`src/routes/index.tsx`)**:
    - Summary stat cards: Total Pipeline Value, Active Proposals, Approved Proposals.
    - Data table listing proposals with columns: Client Name, Price (formatted USD), Status (colored pill badge), Created Date (formatted), Actions (Edit button, Public View link).
    - Quick "Create New Proposal" action.
  - **Editor Route (`src/routes/edit.$proposalId.tsx`)**:
    - Form inputs for `client_name`, `price`, `status`, `scope_of_work`.
    - Live estimate summary card.
    - TanStack Query mutation for saving updates back to Supabase.
    - Toast feedback on save success/error.
    - Direct link to preview client's view `/p/$proposalId`.
  - **Public View Route (`src/routes/p.$proposalId.tsx`)**:
    - High-trust, client-facing presentation view.
    - Verified proposal header, scope of work sections, total investment summary.
    - Interactive "Accept & Approve Proposal" button (triggers mutation to set status to `approved`!).

### Phase 5: Verification & Dev Server Testing
- Run TypeScript compiler checks (`tsc --noEmit`).
- Run Vite production build (`npm run build`).
- Start Vite dev server and verify the UI rendering, responsiveness, and interactivity.
- Halt for user review.

