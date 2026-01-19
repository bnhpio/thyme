import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { api } from '@/../convex/_generated/api';
import { getServerConvex } from '@/lib/tanstack-auth/server';
import { OrganizationForm } from '@/pages/Organization/OrganizationForm';

export const Route = createFileRoute('/organization-setup')({
  component: OrganizationSetupComponent,
  loader: async () => {
    const convex = await getServerConvex();
    const user = await convex.query(api.query.user.getCurrentUser);
    if (!user) {
      throw redirect({ to: '/docs' });
    }
    const organization = await convex.query(
      api.query.user.getUserOrganizations,
      { userId: user?.id },
    );

    if (organization.length > 0) {
      throw redirect({ to: '/docs' });
    }
  },
});

function OrganizationSetupComponent() {
  const navigate = useNavigate();
  const handleSuccess = () => {
    // Redirect to dashboard after successful creation
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="">
      <OrganizationForm
        onSuccess={handleSuccess}
        showPendingInvites={true}
        isModal={false}
      />
    </div>
  );
}
