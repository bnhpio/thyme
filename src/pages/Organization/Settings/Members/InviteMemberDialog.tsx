import { useCustomer } from 'autumn-js/react';
import { useAction } from 'convex/react';
import { UserPlus } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import PaywallDialog from '@/components/autumn/paywall-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModal } from '@/hooks/use-modal';
import { getErrorMessage } from '@/lib/utils';
import type { Role } from './utils';

interface InviteMemberFormProps {
  organizationId: Id<'organizations'>;
  isAdmin: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Internal form component
function InviteMemberForm({
  organizationId,
  isAdmin,
  onSuccess,
  onCancel,
}: InviteMemberFormProps) {
  const inviteMember = useAction(api.action.organizations.inviteMember);
  const { check } = useCustomer();

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
      setEmail('');
      setRole('member');
      onSuccess?.();
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
    onCancel?.();
  };

  return (
    <>
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
          <Select value={role} onValueChange={(value: Role) => setRole(value)}>
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
      <div className="flex-col gap-2 sm:flex-row flex">
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
      </div>
    </>
  );
}

// Modal content wrapper using useModal
export function InviteMemberModalContent({
  organizationId,
  isAdmin,
  onSuccess,
}: {
  organizationId: Id<'organizations'>;
  isAdmin: boolean;
  onSuccess?: () => void;
}) {
  const { close } = useModal();

  if (!isAdmin) {
    return null;
  }

  return (
    <InviteMemberForm
      organizationId={organizationId}
      isAdmin={isAdmin}
      onSuccess={() => {
        onSuccess?.();
        close();
      }}
      onCancel={close}
    />
  );
}

// Trigger component for backward compatibility
interface InviteMemberDialogProps {
  organizationId: Id<'organizations'>;
  isAdmin: boolean;
}

export function InviteMemberDialog({
  organizationId,
  isAdmin,
}: InviteMemberDialogProps) {
  const { open } = useModal();

  if (!isAdmin) {
    return null;
  }

  const handleClick = () => {
    open({
      title: 'Invite Member',
      description: 'Send an invitation to join your organization',
      content: (
        <InviteMemberModalContent
          organizationId={organizationId}
          isAdmin={isAdmin}
        />
      ),
    });
  };

  return (
    <Button onClick={handleClick} className="w-full sm:w-auto">
      <UserPlus className="h-4 w-4 mr-2" />
      Invite Member
    </Button>
  );
}
