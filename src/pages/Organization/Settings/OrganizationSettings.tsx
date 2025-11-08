import type { Id } from '@/../convex/_generated/dataModel';
import { DangerZoneCard } from './Settings/DangerZoneCard';
import { GeneralSettingsCard } from './Settings/GeneralSettingsCard';
import { InviteSettingsCard } from './Settings/InviteSettingsCard';

interface OrganizationSettingsProps {
  organizationId: Id<'organizations'>;
  userRole: string;
}

export function OrganizationSettings({
  organizationId,
  userRole,
}: OrganizationSettingsProps) {
  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      <GeneralSettingsCard organizationId={organizationId} isAdmin={isAdmin} />
      <InviteSettingsCard organizationId={organizationId} isAdmin={isAdmin} />
      <DangerZoneCard organizationId={organizationId} isAdmin={isAdmin} />
    </div>
  );
}
