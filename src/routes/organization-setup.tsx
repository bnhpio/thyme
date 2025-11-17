import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
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
      throw redirect({ to: '/dashboard' });
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
