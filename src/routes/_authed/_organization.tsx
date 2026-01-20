import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getCurrentUser, getUserOrganizations } from '@/serverFn/convex';

export const Route = createFileRoute('/_authed/_organization')({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: '/login' });
    }
    const organization = await getUserOrganizations({
      data: { userId: user.id },
    });

    if (organization.length === 0) {
      throw redirect({ to: '/organization-setup' });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
