import { useAction, useQuery } from 'convex/react';
import { Mail, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage } from '@/lib/utils';
import { getRoleBadgeVariant, getRoleIcon } from './utils';

interface PendingInvitationsCardProps {
  organizationId: Id<'organizations'>;
  isAdmin: boolean;
}

export function PendingInvitationsCard({
  organizationId,
  isAdmin,
}: PendingInvitationsCardProps) {
  const invites = useQuery(api.query.organization.getOrganizationInvites, {
    organizationId,
  });
  const cancelInvite = useAction(api.action.organizations.cancelInvite);
  const deleteInvite = useAction(api.action.organizations.deleteInvite);

  const [cancellingInviteId, setCancellingInviteId] =
    useState<Id<'organizationInvites'> | null>(null);
  const [deletingInviteId, setDeletingInviteId] =
    useState<Id<'organizationInvites'> | null>(null);

  const handleCancelInvite = async (inviteId: Id<'organizationInvites'>) => {
    if (!isAdmin) {
      return;
    }

    setCancellingInviteId(inviteId);
    try {
      await cancelInvite({ inviteId });
      // Tracking happens automatically on the backend via scheduler
      toast.success('Invitation cancelled');
    } catch (error) {
      console.error('Failed to cancel invite:', error);
      toast.error(getErrorMessage(error, 'Failed to cancel invitation'));
    } finally {
      setCancellingInviteId(null);
    }
  };

  const handleDeleteInvite = async (inviteId: Id<'organizationInvites'>) => {
    if (!isAdmin) {
      return;
    }

    setDeletingInviteId(inviteId);
    try {
      await deleteInvite({ inviteId });
      toast.success('Invitation deleted');
    } catch (error) {
      console.error('Failed to delete invite:', error);
      toast.error(getErrorMessage(error, 'Failed to delete invitation'));
    } finally {
      setDeletingInviteId(null);
    }
  };

  if (!invites) {
    if (!isAdmin) {
      return null;
    }
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Invited By
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invites.length === 0 || !isAdmin) {
    return null;
  }

  // Separate invites by status
  const pendingInvites = invites.filter(
    (invite) => invite.status === 'pending' && !invite.isExpired,
  );
  const expiredInvites = invites.filter(
    (invite) => invite.status === 'pending' && invite.isExpired,
  );
  const cancelledInvites = invites.filter(
    (invite) => invite.status === 'cancelled',
  );
  const allInvites = [
    ...pendingInvites,
    ...expiredInvites,
    ...cancelledInvites,
  ];

  if (allInvites.length === 0) {
    return null;
  }

  const getStatusBadge = (invite: (typeof invites)[0]) => {
    if (invite.status === 'cancelled') {
      return <Badge variant="outline">Cancelled</Badge>;
    }
    if (invite.isExpired || invite.status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitations</CardTitle>
        <CardDescription>
          All invitations including pending, expired, and cancelled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Invited By
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allInvites.map((invite) => (
                <TableRow key={invite._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[200px] sm:max-w-none">
                        {invite.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(invite.role)}>
                      {getRoleIcon(invite.role)}
                      <span className="ml-1 capitalize">{invite.role}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {invite.inviter?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>{getStatusBadge(invite)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {invite.status === 'pending' && !invite.isExpired ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvite(invite._id)}
                          disabled={
                            cancellingInviteId === invite._id ||
                            deletingInviteId === invite._id
                          }
                          title="Cancel invitation"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {(invite.status === 'cancelled' ||
                        invite.status === 'expired' ||
                        invite.isExpired) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvite(invite._id)}
                          disabled={
                            cancellingInviteId === invite._id ||
                            deletingInviteId === invite._id
                          }
                          title="Delete invitation"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
