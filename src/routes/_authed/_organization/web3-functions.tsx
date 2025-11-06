import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/_authed/_organization/web3-functions')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <div>Hello "/_authed/_organization/web3-functions"!</div>
    </DashboardLayout>
  );
}
