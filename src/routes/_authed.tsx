import { createFileRoute, Outlet } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { convex } from '@/integrations/convex/provider';
import { Login } from '@/pages/Login/Login';

export const Route = createFileRoute('/_authed')({
  component: RouteComponent,
  ssr: false,

  beforeLoad: async () => {
    const isAuthenticated = await convex.query(api.auth.isAuthenticated);
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return <Login />;
    }

    throw error;
  },
});

function RouteComponent() {
  return <Outlet />;
}
