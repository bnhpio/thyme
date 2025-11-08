import { createFileRoute, redirect } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { convex } from '@/integrations/convex/provider';
import { OrganizationSettingsLayout } from '@/layouts/OrganizationSettingsLayout';

export const Route = createFileRoute(
  '/_authed/_organization/organization/$slug/settings',
)({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const user = await convex.query(api.query.user.getCurrentUser);
    if (!user) {
      throw redirect({ to: '/login' });
    }

    // Get organization by slug
    const organizations = await convex.query(
      api.query.user.getUserOrganizations,
      { userId: user.id },
    );

    const organization = organizations.find((org) => org.slug === params.slug);

    if (!organization) {
      throw redirect({ to: '/' });
    }

    // Verify user is a member
    if (!organization._id) {
      throw redirect({ to: '/' });
    }

    const membership = await convex.query(
      api.query.organization.getOrganizationMembership,
      {
        organizationId: organization._id,
        userId: user.id,
      },
    );

    if (!membership || membership.status !== 'active') {
      throw redirect({ to: '/' });
    }

    return {
      organization,
      membership,
    };
  },
});

function RouteComponent() {
  const { organization, membership } = Route.useRouteContext();
  const { slug } = Route.useParams();

  return (
    <OrganizationSettingsLayout slug={slug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization settings and members
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <p className="text-muted-foreground">
            Organization: {organization.name}
          </p>
          <p className="text-muted-foreground">Your role: {membership.role}</p>
          <p className="text-muted-foreground mt-4">
            Settings page coming soon...
          </p>
        </div>
      </div>
    </OrganizationSettingsLayout>
  );
}
