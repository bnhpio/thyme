import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { ExecutablesList } from './ExecutablesList';

export function Executables() {
  const currentOrgId = useQuery(api.query.user.getCurrentUserOrganizationId);

  if (!currentOrgId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Executable Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Please select an organization to view executable tasks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Executable Tasks</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your scheduled executable tasks
        </p>
      </div>

      <ExecutablesList organizationId={currentOrgId} />
    </div>
  );
}
