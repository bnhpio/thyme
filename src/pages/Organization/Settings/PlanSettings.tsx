import type { Id } from '@/../convex/_generated/dataModel';
import { PlanManagementCard } from './Plan/PlanManagementCard';
import { UsageCard } from './Plan/UsageCard';

interface PlanSettingsProps {
  organizationId: Id<'organizations'>;
  userRole: string;
}

export function PlanSettings({ organizationId, userRole }: PlanSettingsProps) {
  const isAdmin = userRole === 'admin';
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Only admins can access plan settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PlanManagementCard organizationId={organizationId} />
      <UsageCard />
    </div>
  );
}
