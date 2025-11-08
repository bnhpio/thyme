import { useMutation, useQuery } from 'convex/react';
import { MoreVertical, User } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { Role } from './utils';
import { getRoleBadgeVariant, getRoleIcon } from './utils';

interface ActiveMembersCardProps {
  organizationId: Id<'organizations'>;
  userRole: string;
  currentUserId?: Id<'users'>;
}

interface PendingChange {
  memberId: Id<'organizationMembers'>;
  type: 'role' | 'remove';
  originalRole?: Role;
  newRole?: Role;
}

export function ActiveMembersCard({
  organizationId,
  userRole,
  currentUserId,
}: ActiveMembersCardProps) {
  const members = useQuery(api.query.organization.getOrganizationMembers, {
    organizationId,
  });
  const changeMemberRole = useMutation(
    api.mutation.organizations.changeMemberRole,
  );
  const removeMember = useMutation(api.mutation.organizations.removeMember);

  const [pendingChanges, setPendingChanges] = useState<
    Map<Id<'organizationMembers'>, PendingChange>
  >(new Map());
  const [isApplying, setIsApplying] = useState(false);

  const isAdmin = userRole === 'admin';

  const handleRoleChange = (
    memberId: Id<'organizationMembers'>,
    newRole: Role,
  ) => {
    if (!isAdmin) {
      return;
    }

    const member = members?.find((m) => m._id === memberId);
    if (!member) {
      return;
    }

    setPendingChanges((prev) => {
      const next = new Map(prev);
      next.set(memberId, {
        memberId,
        type: 'role',
        originalRole: member.role as Role,
        newRole,
      });
      return next;
    });
  };

  const handleRemoveMember = (memberId: Id<'organizationMembers'>) => {
    if (!isAdmin) {
      return;
    }

    const member = members?.find((m) => m._id === memberId);
    if (!member) {
      return;
    }

    setPendingChanges((prev) => {
      const next = new Map(prev);
      next.set(memberId, {
        memberId,
        type: 'remove',
        originalRole: member.role as Role,
      });
      return next;
    });
  };

  const handleApplyChanges = async () => {
    if (pendingChanges.size === 0) {
      return;
    }

    setIsApplying(true);
    const errors: string[] = [];

    try {
      for (const change of pendingChanges.values()) {
        try {
          if (change.type === 'role' && change.newRole) {
            await changeMemberRole({
              organizationId,
              memberId: change.memberId,
              newRole: change.newRole,
            });
          } else if (change.type === 'remove') {
            await removeMember({
              organizationId,
              memberId: change.memberId,
            });
          }
        } catch (error) {
          const errorMessage = getErrorMessage(
            error,
            change.type === 'role'
              ? 'Failed to change role'
              : 'Failed to remove member',
          );
          errors.push(errorMessage);
        }
      }

      if (errors.length > 0) {
        toast.error(`Some changes failed: ${errors.join(', ')}`);
      } else {
        toast.success('Changes applied successfully');
        setPendingChanges(new Map());
      }
    } catch (error) {
      console.error('Failed to apply changes:', error);
      toast.error(getErrorMessage(error, 'Failed to apply changes'));
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancelChanges = () => {
    setPendingChanges(new Map());
    toast.info('Changes cancelled');
  };

  const getEffectiveRole = (memberId: Id<'organizationMembers'>): Role => {
    const change = pendingChanges.get(memberId);
    if (change?.type === 'role' && change.newRole) {
      return change.newRole;
    }
    const member = members?.find((m) => m._id === memberId);
    return (member?.role as Role) || 'member';
  };

  const isMemberRemoved = (memberId: Id<'organizationMembers'>): boolean => {
    return pendingChanges.get(memberId)?.type === 'remove';
  };

  if (!members) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasPendingChanges = pendingChanges.size > 0;
  const visibleMembers = members.filter(
    (member) => !isMemberRemoved(member._id),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Active Members</CardTitle>
            <CardDescription>
              {visibleMembers.length} member
              {visibleMembers.length !== 1 ? 's' : ''} in this organization
            </CardDescription>
          </div>
          {hasPendingChanges && isAdmin && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelChanges}
                disabled={isApplying}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplyChanges}
                disabled={isApplying}
                className="w-full sm:w-auto"
              >
                {isApplying ? 'Applying...' : 'Apply Changes'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleMembers.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                const canModify = isAdmin && !isCurrentUser;
                const effectiveRole = getEffectiveRole(member._id);
                const hasPendingChange = pendingChanges.has(member._id);
                const pendingChange = pendingChanges.get(member._id);

                return (
                  <TableRow
                    key={member._id}
                    className={hasPendingChange ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {member.user?.name || member.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {member.user?.email || member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(effectiveRole)}>
                          {getRoleIcon(effectiveRole)}
                          <span className="ml-1 capitalize">
                            {effectiveRole}
                          </span>
                        </Badge>
                        {hasPendingChange && pendingChange?.type === 'role' && (
                          <span className="text-xs text-muted-foreground">
                            (pending)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {canModify ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {effectiveRole !== 'admin' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(member._id, 'admin')
                                  }
                                >
                                  Change to Admin
                                </DropdownMenuItem>
                              )}
                              {effectiveRole !== 'member' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(member._id, 'member')
                                  }
                                >
                                  Change to Member
                                </DropdownMenuItem>
                              )}
                              {effectiveRole !== 'viewer' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(member._id, 'viewer')
                                  }
                                >
                                  Change to Viewer
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member._id)}
                                className="text-destructive"
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            You
                          </span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
