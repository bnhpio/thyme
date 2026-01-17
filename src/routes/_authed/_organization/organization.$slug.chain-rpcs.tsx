import { createFileRoute, redirect } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { convex } from '@/integrations/convex/provider';
import { OrganizationSettingsLayout } from '@/layouts/OrganizationSettingsLayout';
import { ChainRpcSettings } from '@/pages/Organization/Settings/ChainRpcSettings';

export const Route = createFileRoute(
  '/_authed/_organization/organization/$slug/chain-rpcs',
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
  const { organization } = Route.useRouteContext();
  const { slug } = Route.useParams();

  if (!organization._id) {
    return <div>Error: Organization not found</div>;
  }

  return (
    <OrganizationSettingsLayout slug={slug}>
      <ChainRpcSettings organizationId={organization._id} />
    </OrganizationSettingsLayout>
  );
}
