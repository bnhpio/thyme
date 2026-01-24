import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Login } from '@/pages/Login/Login';

export const Route = createFileRoute('/_authed')({
  component: RouteComponent,

  beforeLoad: async () => {
    const { isAuthenticated } = await import('@/lib/tanstack-auth/server');
    const authed = await isAuthenticated();
    if (!authed) {
      throw redirect({ to: '/docs' });
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
