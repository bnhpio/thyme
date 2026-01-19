import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { getServerConvex } from '@/lib/tanstack-auth/server';

export const Route = createFileRoute('/_authed/_organization')({
  component: RouteComponent,
  beforeLoad: async () => {
    const convex = await getServerConvex();
    const user = await convex.query(api.query.user.getCurrentUser);
    if (!user) {
      throw redirect({ to: '/login' });
    }
    const organization = await convex.query(
      api.query.user.getUserOrganizations,
      { userId: user?.id },
    );

    if (organization.length === 0) {
      throw redirect({ to: '/organization-setup' });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
