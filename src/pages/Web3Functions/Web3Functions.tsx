import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { FunctionList } from './FunctionList';

export function Web3Functions() {
  const currentOrgId = useQuery(api.query.user.getCurrentUserOrganizationId);

  const tasks = useQuery(
    api.query.task.getTasksByOrganization,
    currentOrgId ? { organizationId: currentOrgId } : 'skip',
  );

  if (!currentOrgId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Web3 Functions</h1>
          <p className="text-muted-foreground mt-1">
            Please select an organization to view functions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Web3 Functions</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your uploaded Web3 functions
        </p>
      </div>

      <FunctionList
        tasks={tasks || []}
        organizationId={currentOrgId}
        onExecutableCreated={() => {
          // Could refresh or show notification
        }}
      />
    </div>
  );
}
