import { createFileRoute, redirect } from '@tanstack/react-router';
import { api } from '@/../convex/_generated/api';
import { convex } from '@/integrations/convex/provider';
import { OrganizationForm } from '@/pages/Organization/OrganizationForm';

export const Route = createFileRoute('/organization-setup')({
  component: OrganizationSetupComponent,
  loader: async () => {
    const user = await convex.query(api.query.user.getCurrentUser);
    if (!user) {
      throw redirect({ to: '/login' });
    }
    const organization = await convex.query(
      api.query.user.getUserOrganizations,
      { userId: user?.id },
    );

    if (organization.length > 0) {
      throw redirect({ to: '/' });
    }
  },
});

function OrganizationSetupComponent() {
  const handleSuccess = () => {
    // Redirect to dashboard after successful creation
    window.location.href = '/';
  };

  return (
    <OrganizationForm
      onSuccess={handleSuccess}
      showPendingInvites={true}
      isModal={false}
    />
  );
}
