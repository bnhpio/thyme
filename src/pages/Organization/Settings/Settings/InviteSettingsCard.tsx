import { useMutation, useQuery } from 'convex/react';
import { Save } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { getErrorMessage } from '@/lib/utils';

interface InviteSettingsCardProps {
  organizationId: Id<'organizations'>;
  isAdmin: boolean;
}

export function InviteSettingsCard({
  organizationId,
  isAdmin,
}: InviteSettingsCardProps) {
  const organization = useQuery(api.query.organization.getOrganizationById, {
    organizationId,
  });
  const updateOrganization = useMutation(
    api.mutation.organizations.updateOrganization,
  );

  const [allowInvites, setAllowInvites] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [defaultRole, setDefaultRole] = useState<'member' | 'viewer'>('member');
  const [isSaving, setIsSaving] = useState(false);

  const defaultRoleId = useId();

  // Initialize form data from organization
  useEffect(() => {
    if (organization?.settings) {
      setAllowInvites(organization.settings.allowInvites ?? true);
      setRequireApproval(organization.settings.requireApproval ?? false);
      setDefaultRole(
        (organization.settings.defaultRole as 'member' | 'viewer') || 'member',
      );
    }
  }, [organization]);

  const hasChanges =
    allowInvites !== (organization?.settings?.allowInvites ?? true) ||
    requireApproval !== (organization?.settings?.requireApproval ?? false) ||
    defaultRole !== (organization?.settings?.defaultRole || 'member');

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error('Only admins can update organization settings');
      return;
    }

    setIsSaving(true);
    try {
      await updateOrganization({
        organizationId,
        settings: {
          allowInvites,
          requireApproval,
          defaultRole,
        },
      });
      toast.success('Invite settings updated');
    } catch (error) {
      console.error('Failed to update invite settings:', error);
      toast.error(getErrorMessage(error, 'Failed to update invite settings'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (organization?.settings) {
      setAllowInvites(organization.settings.allowInvites ?? true);
      setRequireApproval(organization.settings.requireApproval ?? false);
      setDefaultRole(
        (organization.settings.defaultRole as 'member' | 'viewer') || 'member',
      );
    }
    toast.info('Changes cancelled');
  };

  if (!organization) {
    if (!isAdmin) {
      return null;
    }
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-11" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-11" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Invite Settings</CardTitle>
            <CardDescription>
              Configure how members are invited to your organization
            </CardDescription>
          </div>
          {hasChanges && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5 flex-1">
            <Label>Allow Invites</Label>
            <p className="text-sm text-muted-foreground">
              Allow admins to invite new members
            </p>
          </div>
          <Switch
            checked={allowInvites}
            onCheckedChange={setAllowInvites}
            disabled={isSaving}
            className={hasChanges ? 'ring-2 ring-primary' : ''}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5 flex-1">
            <Label>Require Approval</Label>
            <p className="text-sm text-muted-foreground">
              Require admin approval for new members
            </p>
          </div>
          <Switch
            checked={requireApproval}
            onCheckedChange={setRequireApproval}
            disabled={isSaving}
            className={hasChanges ? 'ring-2 ring-primary' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={defaultRoleId}>Default Role</Label>
          <Select
            value={defaultRole}
            onValueChange={(value: 'member' | 'viewer') =>
              setDefaultRole(value)
            }
            disabled={isSaving}
          >
            <SelectTrigger
              id={defaultRoleId}
              className={hasChanges ? 'border-primary' : ''}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
