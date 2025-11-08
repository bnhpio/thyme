import { useMutation, useQuery } from 'convex/react';
import { Save, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/utils';

interface OrganizationSettingsProps {
  organizationId: Id<'organizations'>;
  userRole: string;
}

export function OrganizationSettings({
  organizationId,
  userRole,
}: OrganizationSettingsProps) {
  const organization = useQuery(api.query.organization.getOrganizationById, {
    organizationId,
  });
  const updateOrganization = useMutation(
    api.mutation.organizations.updateOrganization,
  );
  const deleteOrganization = useMutation(
    api.mutation.organizations.deleteOrganization,
  );

  const [formData, setFormData] = useState<{
    name?: string;
    description?: string;
    allowInvites?: boolean;
    requireApproval?: boolean;
    defaultRole?: string;
  }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use organization data directly, with formData for user edits
  const name = formData.name ?? organization?.name ?? '';
  const description = formData.description ?? organization?.description ?? '';
  const allowInvites =
    formData.allowInvites ?? organization?.settings?.allowInvites ?? true;
  const requireApproval =
    formData.requireApproval ??
    organization?.settings?.requireApproval ??
    false;
  const defaultRole =
    formData.defaultRole ?? organization?.settings?.defaultRole ?? 'member';

  const isAdmin = userRole === 'admin';
  const nameId = useId();
  const descriptionId = useId();
  const defaultRoleId = useId();

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error('Only admins can update organization settings');
      return;
    }

    setIsSaving(true);
    try {
      await updateOrganization({
        organizationId,
        name,
        description,
        settings: {
          allowInvites,
          requireApproval,
          defaultRole,
        },
      });
      toast.success('Organization settings updated');
    } catch (error) {
      console.error('Failed to update organization:', error);
      toast.error(getErrorMessage(error, 'Failed to update organization'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOrganization({ organizationId });
      toast.success('Organization deleted');
      // Redirect will be handled by the route
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete organization:', error);
      toast.error(getErrorMessage(error, 'Failed to delete organization'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Update your organization's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={nameId}>Organization Name</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!isAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={descriptionId}>Description</Label>
            <Textarea
              id={descriptionId}
              value={description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={!isAdmin}
              rows={3}
            />
          </div>

          {isAdmin && (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Settings</CardTitle>
            <CardDescription>
              Configure how members are invited to your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Allow admins to invite new members
                </p>
              </div>
              <Switch
                checked={allowInvites}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowInvites: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require admin approval for new members
                </p>
              </div>
              <Switch
                checked={requireApproval}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requireApproval: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={defaultRoleId}>Default Role</Label>
              <Select
                value={defaultRole}
                onValueChange={(value) =>
                  setFormData({ ...formData, defaultRole: value })
                }
              >
                <SelectTrigger id={defaultRoleId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Organization
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the organization and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Organization'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
