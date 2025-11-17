import { useMutation } from 'convex/react';
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
import { getErrorMessage } from '@/lib/utils';

interface LeaveOrganizationCardProps {
  organizationId: Id<'organizations'>;
  isAdmin: boolean;
}

export function LeaveOrganizationCard({
  organizationId,
  isAdmin,
}: LeaveOrganizationCardProps) {
  const leaveOrganization = useMutation(
    api.mutation.organizations.leaveOrganization,
  );

  const handleLeave = async () => {
    try {
      await leaveOrganization({ organizationId });
      toast.success('You have left the organization');
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to leave organization:', error);
      toast.error(getErrorMessage(error, 'Failed to leave organization'));
    }
  };

  if (isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Organization</CardTitle>
        <CardDescription>
          Leave this organization. You can be re-invited later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={handleLeave}>
          Leave Organization
        </Button>
      </CardContent>
    </Card>
  );
}
