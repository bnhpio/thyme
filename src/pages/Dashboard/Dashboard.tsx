import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { ChainDistributionChart } from './ChainDistributionChart';
import { OverviewCards } from './OverviewCards';
import { QuickActions } from './QuickActions';
import { RecentExecutablesTable } from './RecentExecutablesTable';
import { TopExecutablesList } from './TopExecutablesList';

export function Dashboard() {
  const currentOrgId = useQuery(api.query.user.getCurrentUserOrganizationId);

  const overview = useQuery(
    api.query.dashboard.getDashboardOverview,
    currentOrgId ? { organizationId: currentOrgId } : 'skip',
  );

  const chainDistribution = useQuery(
    api.query.dashboard.getExecutablesByChain,
    currentOrgId ? { organizationId: currentOrgId } : 'skip',
  );

  const recentExecutables = useQuery(
    api.query.dashboard.getRecentExecutables,
    currentOrgId ? { organizationId: currentOrgId, limit: 20 } : 'skip',
  );

  const topExecutables = useQuery(
    api.query.dashboard.getTopExecutables,
    currentOrgId ? { organizationId: currentOrgId, limit: 10 } : 'skip',
  );

  if (!currentOrgId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Please select an organization to view dashboard
          </p>
        </div>
      </div>
    );
  }

  const isLoading =
    overview === undefined ||
    chainDistribution === undefined ||
    recentExecutables === undefined ||
    topExecutables === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your organization's executables
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 border rounded-lg animate-pulse bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Overview of your organization's executables
        </p>
      </div>

      {overview && (
        <OverviewCards data={overview} organizationId={currentOrgId} />
      )}

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 w-full min-w-0">
        {chainDistribution && (
          <ChainDistributionChart data={chainDistribution} />
        )}
        {topExecutables && <TopExecutablesList executables={topExecutables} />}
      </div>

      {recentExecutables && (
        <RecentExecutablesTable executables={recentExecutables} />
      )}

      <QuickActions />
    </div>
  );
}
