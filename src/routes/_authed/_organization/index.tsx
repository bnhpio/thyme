import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Dashboard } from '@/pages/Dashboard/Dashboard';

export const Route = createFileRoute('/_authed/_organization/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}
