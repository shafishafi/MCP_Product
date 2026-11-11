import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { ToastContainer } from '../components/ui/toast';
import { CreateProposalModal } from '../components/proposals/CreateProposalModal';
import { DashboardPage } from '../pages/DashboardPage';
import { EditorPage } from '../pages/EditorPage';
import { PublicViewPage } from '../pages/PublicViewPage';

function RootLayout() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const routerState = useRouterState();
  const isPublicPage = routerState.location.pathname.startsWith('/p/');

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-emerald-100 selection:text-primary">
      {/* Show main SaaS Navbar only on internal freelancer dashboard/editor pages */}
      {!isPublicPage && (
        <Navbar onOpenCreate={() => setIsCreateOpen(true)} />
      )}

      {/* Main Content Area */}
      <div className={!isPublicPage ? 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8' : 'flex-1 w-full'}>
        <Outlet />
      </div>

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Global Quick Create Modal */}
      <CreateProposalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}

// 1. Root Route
export const rootRoute = createRootRoute({
  component: RootLayout,
});

// 2. Dashboard Route (/)
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

// 3. Edit Route (/edit/$proposalId)
export const editRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit/$proposalId',
  component: EditorPage,
});

// 4. Public Proposal View (/p/$proposalId)
export const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/p/$proposalId',
  component: PublicViewPage,
});

// Route Tree
const routeTree = rootRoute.addChildren([indexRoute, editRoute, publicRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

