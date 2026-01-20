import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { OrganizationForm } from '@/pages/Organization/OrganizationForm';
import { getCurrentUser, getUserOrganizations } from '@/serverFn/convex';

export const Route = createFileRoute('/organization-setup')({
  component: OrganizationSetupComponent,
  loader: async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: '/docs' });
    }
    const organization = await getUserOrganizations({
      data: { userId: user.id },
    });

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
