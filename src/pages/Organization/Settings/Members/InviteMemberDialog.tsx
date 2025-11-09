import { useCustomer } from 'autumn-js/react';
import { useAction } from 'convex/react';
import { UserPlus } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import PaywallDialog from '@/components/autumn/paywall-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getErrorMessage } from '@/lib/utils';
import type { Role } from './utils';

interface InviteMemberDialogProps {
  organizationId: Id<'organizations'>;
  isAdmin: boolean;
}

export function InviteMemberDialog({
  organizationId,
  isAdmin,
}: InviteMemberDialogProps) {
  const inviteMember = useAction(api.action.organizations.inviteMember);
  const { check } = useCustomer();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [isInviting, setIsInviting] = useState(false);

  const emailId = useId();
  const roleId = useId();

  const handleInvite = async () => {
    if (!isAdmin) {
      toast.error('Only admins can invite members');
      return;
    }

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    const result = check({
      featureId: 'members',
      dialog: PaywallDialog,
      withPreview: true,
    });

    if (!result.data.allowed) {
      toast.error('Member limit reached');
      return;
    }

    setIsInviting(true);
    try {
      await inviteMember({
        organizationId,
        email: email.trim(),
        role,
      });

      toast.success('Invitation sent');
      setOpen(false);
      setEmail('');
      setRole('member');
    } catch (error) {
      console.error('Failed to invite member:', error);
      const errorMessage = getErrorMessage(error, 'Failed to send invitation');

      toast.error(errorMessage);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancel = () => {
    setEmail('');
    setRole('member');
    setOpen(false);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isInviting) {
                  handleInvite();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={roleId}>Role</Label>
            <Select
              value={role}
              onValueChange={(value: Role) => setRole(value)}
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
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isInviting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={isInviting || !email.trim()}
            className="w-full sm:w-auto"
          >
            {isInviting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
