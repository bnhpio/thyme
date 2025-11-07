import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { CreateProfileDialog } from './CreateProfileDialog';
import { ProfileList } from './ProfileList';

export function Profiles() {
  const currentOrgId = useQuery(api.query.user.getCurrentUserOrganizationId);

  const profiles = useQuery(
    api.query.profile.getProfilesByOrganization,
    currentOrgId ? { organizationId: currentOrgId } : 'skip',
  );

  const deleteProfile = useMutation(api.mutation.profile.deleteProfile);

  const handleDeleteProfile = async (profileId: Id<'profiles'>) => {
    try {
      await deleteProfile({ profileId });
      toast.success('Profile deleted successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete profile',
      );
    }
  };

  const handleRefresh = () => {
    // Query will automatically refresh
  };

  if (!currentOrgId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profiles</h1>
          <p className="text-muted-foreground mt-1">
            Please select an organization to view profiles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profiles</h1>
          <p className="text-muted-foreground mt-1">
            Manage profiles for your organization
          </p>
        </div>
        <CreateProfileDialog
          organizationId={currentOrgId}
          onSuccess={handleRefresh}
        />
      </div>

      <ProfileList
        profiles={profiles || []}
        onDelete={handleDeleteProfile}
        onRefresh={handleRefresh}
        organizationId={currentOrgId}
      />
    </div>
  );
}
