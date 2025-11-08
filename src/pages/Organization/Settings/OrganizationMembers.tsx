import type { Id } from '@/../convex/_generated/dataModel';
import { ActiveMembersCard } from './Members/ActiveMembersCard';
import { InviteMemberDialog } from './Members/InviteMemberDialog';
import { LeaveOrganizationCard } from './Members/LeaveOrganizationCard';
import { PendingInvitationsCard } from './Members/PendingInvitationsCard';

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
  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-muted-foreground">
            Manage members and invitations for your organization
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <InviteMemberDialog
            organizationId={organizationId}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      <PendingInvitationsCard
        organizationId={organizationId}
        isAdmin={isAdmin}
      />

      <ActiveMembersCard
        organizationId={organizationId}
        userRole={userRole}
        currentUserId={currentUserId}
      />

      <LeaveOrganizationCard
        organizationId={organizationId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
