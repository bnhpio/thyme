import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/utils';

interface OrganizationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showPendingInvites?: boolean;
  isModal?: boolean;
}

export function OrganizationForm({
  onSuccess,
  onCancel,
  showPendingInvites = true,
  isModal = false,
}: OrganizationFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  // Get current user info
  const currentUser = useQuery(api.query.user.getCurrentUser);

  // Check existing organizations
  const userOrganizations = useQuery(
    api.query.user.getUserOrganizations,
    currentUser?.id ? { userId: currentUser.id } : 'skip',
  );

  // Check for pending invites (only show if requested)
  const pendingInvites = useQuery(
    api.query.user.getUserPendingInvites,
    showPendingInvites && currentUser?.email
      ? { email: currentUser.email }
      : 'skip',
  );

  const createOrganization = useMutation(
    api.mutation.organizations.createOrganization,
  );
  const acceptInvite = useMutation(api.mutation.organizations.acceptInvite);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    setIsCreating(true);
    try {
      await createOrganization({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      });

      // Reset form
      setFormData({ name: '', slug: '', description: '' });

      toast.success('Organization created successfully');
      // Call success callback
      onSuccess?.();
    } catch (error) {
      // Extract and display error message
      const errorMessage = getErrorMessage(
        error,
        'Failed to create organization. Please try again.',
      );

      // Only log to console in development, toast will show to user
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create organization:', error);
      }

      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptInvite = async (token: string) => {
    if (!currentUser) return;

    try {
      await acceptInvite({
        token,
      });

      toast.success('Invitation accepted successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to accept invite:', error);
      toast.error(
        getErrorMessage(error, 'Failed to accept invite. Please try again.'),
      );
    }
  };

  const isFirstOrganization =
    !userOrganizations || userOrganizations.length === 0;

  return (
    <div
      className={
        isModal
          ? 'space-y-6'
          : 'min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4'
      }
    >
      <div className={isModal ? 'space-y-6' : 'w-full max-w-2xl space-y-6'}>
        {/* Pending Invites */}
        {showPendingInvites && pendingInvites && pendingInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>You have pending invitations</CardTitle>
              <CardDescription>
                You've been invited to join these organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingInvites.map((invite: any) => (
                <div
                  key={invite._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">
                      {invite.organization?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Role: {invite.role} • Invited by{' '}
                      {invite.inviter?.email ||
                        invite.inviter?.name ||
                        'Unknown'}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAcceptInvite(invite.token)}
                    size="sm"
                  >
                    Accept Invite
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Create Organization */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isFirstOrganization
                ? 'Create Your Organization'
                : 'Add New Organization'}
            </CardTitle>
            <CardDescription>
              {isFirstOrganization
                ? 'Set up your organization to get started with Convex Gelato'
                : 'Create a new organization to manage your projects'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="My Awesome Organization"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Organization Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, ''),
                    })
                  }
                  placeholder="my-awesome-org"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will be used in your organization URL
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell us about your organization..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {isModal && onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isCreating}
                  className={isModal ? 'flex-1' : 'w-full'}
                >
                  {isCreating
                    ? 'Creating Organization...'
                    : 'Create Organization'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
