import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { getErrorMessage } from '@/lib/utils';

interface DangerZoneCardProps {
  organizationId: Id<'organizations'>;
  isAdmin: boolean;
}

export function DangerZoneCard({
  organizationId,
  isAdmin,
}: DangerZoneCardProps) {
  const navigate = useNavigate();
  const currentUser = useQuery(api.query.user.getCurrentUser);
  const deleteOrganization = useMutation(
    api.mutation.organizations.deleteOrganization,
  );
  const setCurrentOrganization = useMutation(
    api.mutation.organizations.setUserCurrentOrganization,
  );
  const organizations = useQuery(
    api.query.user.getUserOrganizations,
    currentUser?.id ? { userId: currentUser.id } : 'skip',
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!isAdmin) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOrganization({ organizationId });
      toast.success('Organization deleted');

      // Get remaining organizations after deletion
      const remainingOrgs = organizations?.filter(
        (org) => org._id !== organizationId,
      );

      // Switch to first available organization if any exist
      if (remainingOrgs && remainingOrgs.length > 0) {
        const firstOrg = remainingOrgs[0];
        if (firstOrg?._id) {
          await setCurrentOrganization({ organizationId: firstOrg._id });
        }
      }

      // Navigate to root
      navigate({ to: '/' });
    } catch (error) {
      console.error('Failed to delete organization:', error);
      toast.error(getErrorMessage(error, 'Failed to delete organization'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
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
                This action cannot be undone. This will permanently delete the
                organization and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Organization'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
