import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Profiles } from '@/pages/Profiles/Profiles';

export const Route = createFileRoute('/_authed/_organization/profiles')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <Profiles />
    </DashboardLayout>
  );
}
