import { useForm } from '@tanstack/react-form';
import { useAction, useMutation, useQuery } from 'convex/react';
import { useId, useState } from 'react';
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
  const nameId = useId();
  const slugId = useId();
  const descriptionId = useId();

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

  const createOrganization = useAction(
    api.action.organizations.createOrganization,
  );
  const acceptInvite = useMutation(api.mutation.organizations.acceptInvite);

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      if (!currentUser) return;

      setIsCreating(true);
      try {
        await createOrganization({
          name: value.name,
          slug: value.slug,
          description: value.description,
        });

        form.reset();
        toast.success('Organization created successfully');
        onSuccess?.();
      } catch (error) {
        const errorMessage = getErrorMessage(
          error,
          'Failed to create organization. Please try again.',
        );

        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to create organization:', error);
        }

        toast.error(errorMessage);
      } finally {
        setIsCreating(false);
      }
    },
  });

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

  // Primitive form content
  const formContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            if (!value || !value.trim()) {
              return 'Organization name is required';
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={nameId}>Organization Name</Label>
            <Input
              id={nameId}
              data-1p-ignore
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="My Awesome Organization"
            />
            {field.state.meta.errors && (
              <p className="text-sm text-destructive mt-1">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="slug"
        validators={{
          onChange: ({ value }) => {
            if (!value || !value.trim()) {
              return 'Organization slug is required';
            }
            if (!/^[a-z0-9-]+$/.test(value)) {
              return 'Slug can only contain lowercase letters, numbers, and hyphens';
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={slugId}>Organization Slug</Label>
            <Input
              id={slugId}
              data-1p-ignore
              value={field.state.value}
              onChange={(e) =>
                field.handleChange(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                )
              }
              onBlur={field.handleBlur}
              placeholder="my-awesome-org"
            />
            {field.state.meta.errors && (
              <p className="text-sm text-destructive mt-1">
                {field.state.meta.errors[0]}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              This will be used in your organization URL
            </p>
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={descriptionId}>Description (Optional)</Label>
            <Textarea
              id={descriptionId}
              data-1p-ignore
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Tell us about your organization..."
              rows={3}
            />
          </div>
        )}
      </form.Field>

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
          disabled={isCreating || !form.state.canSubmit}
          className={isModal ? 'flex-1' : 'w-full'}
        >
          {isCreating ? 'Creating Organization...' : 'Create Organization'}
        </Button>
      </div>
    </form>
  );

  // Pending invites content
  const pendingInvitesContent =
    showPendingInvites && pendingInvites && pendingInvites.length > 0 ? (
      <div className={isModal ? 'space-y-4' : ''}>
        {isModal ? (
          <div className="space-y-4">
            {pendingInvites.map((invite: any) => (
              <div
                key={invite._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{invite.organization?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Role: {invite.role} • Invited by{' '}
                    {invite.inviter?.email || invite.inviter?.name || 'Unknown'}
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
          </div>
        ) : (
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
      </div>
    ) : null;

  // Render based on modal vs card mode
  if (isModal) {
    return (
      <div className="space-y-6">
        {pendingInvitesContent}
        {formContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-2xl space-y-6">
        {pendingInvitesContent}
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
          <CardContent>{formContent}</CardContent>
        </Card>
      </div>
    </div>
  );
}
