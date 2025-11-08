import { createFileRoute, redirect } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { convex } from '@/integrations/convex/provider';
import { OrganizationSettingsLayout } from '@/layouts/OrganizationSettingsLayout';
import { PlanSettings } from '@/pages/Organization/Settings/PlanSettings';

export const Route = createFileRoute(
  '/_authed/_organization/organization/$slug/plan',
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

    // Only admins can access plan settings
    if (membership.role !== 'admin') {
      throw redirect({
        to: '/organization/$slug/settings',
        params: { slug: params.slug },
      });
    }

    // Get current user for context
    const currentUser = await convex.query(api.query.user.getCurrentUser);

    return {
      organization,
      membership,
      currentUser,
    };
  },
});

function RouteComponent() {
  const { organization, membership } = Route.useRouteContext();
  const { slug } = Route.useParams();

  if (!organization._id) {
    return <div>Error: Organization not found</div>;
  }

  return (
    <OrganizationSettingsLayout slug={slug}>
      <PlanSettings
        organizationId={organization._id}
        userRole={membership.role}
      />
    </OrganizationSettingsLayout>
  );
}
