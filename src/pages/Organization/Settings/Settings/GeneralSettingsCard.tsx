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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/utils';

interface GeneralSettingsCardProps {
  organizationId: Id<'organizations'>;
  isAdmin: boolean;
}

export function GeneralSettingsCard({
  organizationId,
  isAdmin,
}: GeneralSettingsCardProps) {
  const organization = useQuery(api.query.organization.getOrganizationById, {
    organizationId,
  });
  const updateOrganization = useMutation(
    api.mutation.organizations.updateOrganization,
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const nameId = useId();
  const descriptionId = useId();

  // Initialize form data from organization
  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setDescription(organization.description || '');
    }
  }, [organization]);

  const hasChanges =
    name !== (organization?.name || '') ||
    description !== (organization?.description || '');

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error('Only admins can update organization settings');
      return;
    }

    if (!name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateOrganization({
        organizationId,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success('Organization settings updated');
    } catch (error) {
      console.error('Failed to update organization:', error);
      toast.error(getErrorMessage(error, 'Failed to update organization'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (organization) {
      setName(organization.name || '');
      setDescription(organization.description || '');
    }
    toast.info('Changes cancelled');
  };

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Update your organization's basic information
            </CardDescription>
          </div>
          {hasChanges && isAdmin && (
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
        <div className="space-y-2">
          <Label htmlFor={nameId}>Organization Name</Label>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin || isSaving}
            className={hasChanges ? 'border-primary' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={descriptionId}>Description</Label>
          <Textarea
            id={descriptionId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!isAdmin || isSaving}
            rows={3}
            className={hasChanges ? 'border-primary' : ''}
          />
        </div>

        {hasChanges && !isAdmin && (
          <p className="text-sm text-muted-foreground">
            Only admins can save changes
          </p>
        )}
      </CardContent>
    </Card>
  );
}
