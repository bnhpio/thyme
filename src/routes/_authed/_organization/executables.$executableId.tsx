import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ExecutableDetail } from '@/pages/Web3Functions/ExecutableDetail';

export const Route = createFileRoute(
  '/_authed/_organization/executables/$executableId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    console.log('Route loader called with params:', params);
    return { executableId: params.executableId };
  },
});

function RouteComponent() {
  console.log('RouteComponent rendering');
  try {
    const params = Route.useParams();
    console.log('Route params:', params);
    console.log('ExecutableId:', params.executableId);
    return (
      <DashboardLayout>
        <ExecutableDetail executableId={params.executableId} />
      </DashboardLayout>
    );
  } catch (error) {
    console.error('Error in RouteComponent:', error);
    return (
      <DashboardLayout>
        <div>
          Error loading executable:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </DashboardLayout>
    );
  }
}
