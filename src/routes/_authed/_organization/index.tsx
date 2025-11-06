import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/_authed/_organization/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <div>Hello "/_authed/_organization/"!</div>
    </DashboardLayout>
  );
}
