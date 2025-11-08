import { useMutation, useQuery } from 'convex/react';
import {
  Eye,
  Mail,
  MoreVertical,
  Shield,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { useId, useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage } from '@/lib/utils';

interface OrganizationMembersProps {
  organizationId: Id<'organizations'>;
  userRole: string;
  currentUserId?: Id<'users'>;
}

export function OrganizationMembers({
  organizationId,
  userRole,
  currentUserId,
}: OrganizationMembersProps) {
  const members = useQuery(api.query.organization.getOrganizationMembers, {
    organizationId,
  });
  const invites = useQuery(api.query.organization.getOrganizationInvites, {
    organizationId,
  });
  const inviteMember = useMutation(api.mutation.organizations.inviteMember);
  const removeMember = useMutation(api.mutation.organizations.removeMember);
  const changeMemberRole = useMutation(
    api.mutation.organizations.changeMemberRole,
  );
  const cancelInvite = useMutation(api.mutation.organizations.cancelInvite);
  const leaveOrganization = useMutation(
    api.mutation.organizations.leaveOrganization,
  );

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>(
    'member',
  );
  const [isInviting, setIsInviting] = useState(false);

  const isAdmin = userRole === 'admin';
  const emailId = useId();
  const roleId = useId();

  const handleInvite = async () => {
    if (!isAdmin) {
      toast.error('Only admins can invite members');
      return;
    }

    setIsInviting(true);
    try {
      await inviteMember({
        organizationId,
        email: inviteEmail,
        role: inviteRole,
      });
      toast.success('Invitation sent');
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (error) {
      console.error('Failed to invite member:', error);
      toast.error(getErrorMessage(error, 'Failed to send invitation'));
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: Id<'organizationMembers'>) => {
    if (!isAdmin) {
      return;
    }

    try {
      await removeMember({ organizationId, memberId });
      toast.success('Member removed');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error(getErrorMessage(error, 'Failed to remove member'));
    }
  };

  const handleChangeRole = async (
    memberId: Id<'organizationMembers'>,
    newRole: 'admin' | 'member' | 'viewer',
  ) => {
    if (!isAdmin) {
      return;
    }

    try {
      await changeMemberRole({ organizationId, memberId, newRole });
      toast.success('Role updated');
    } catch (error) {
      console.error('Failed to change role:', error);
      toast.error(getErrorMessage(error, 'Failed to change role'));
    }
  };

  const handleCancelInvite = async (inviteId: Id<'organizationInvites'>) => {
    if (!isAdmin) {
      return;
    }

    try {
      await cancelInvite({ inviteId });
      toast.success('Invitation cancelled');
    } catch (error) {
      console.error('Failed to cancel invite:', error);
      toast.error(getErrorMessage(error, 'Failed to cancel invitation'));
    }
  };

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'member':
        return <User className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'member':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (!members || !invites) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-muted-foreground">
            Manage members and invitations for your organization
          </p>
        </div>
        {isAdmin && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor={emailId}>Email</Label>
                  <Input
                    id={emailId}
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={roleId}>Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(value: 'admin' | 'member' | 'viewer') =>
                      setInviteRole(value)
                    }
                  >
                    <SelectTrigger id={roleId}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={isInviting}>
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {invites && invites.length > 0 && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations that are waiting to be accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {invite.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(invite.role)}>
                        {getRoleIcon(invite.role)}
                        <span className="ml-1 capitalize">{invite.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{invite.inviter?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {invite.isExpired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvite(invite._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Members</CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? 's' : ''} in this
            organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                const canModify = isAdmin && !isCurrentUser;

                return (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>

                        <div>
                          <div className="font-medium">
                            {member.user?.name || member.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.user?.email || member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1 capitalize">{member.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(
                                    member._id,
                                    member.role === 'admin'
                                      ? 'member'
                                      : member.role === 'member'
                                        ? 'viewer'
                                        : 'admin',
                                  )
                                }
                              >
                                Change Role
                              </DropdownMenuItem>
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
        </CardContent>
      </Card>

      {!isAdmin && (
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
      )}
    </div>
  );
}
