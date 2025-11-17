import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ExecutableDetail } from '@/pages/Web3Functions/ExecutableDetail';

export const Route = createFileRoute(
  '/_authed/_organization/executables/$executableId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return { executableId: params.executableId };
  },
});

function RouteComponent() {
  try {
    const params = Route.useParams();
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
