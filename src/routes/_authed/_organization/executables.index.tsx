import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Executables } from '@/pages/Web3Functions/Executables';

export const Route = createFileRoute('/_authed/_organization/executables/')({
  component: RouteComponent,
});

function RouteComponent() {
  console.log('executables index route');
  return (
    <DashboardLayout>
      <Executables />
    </DashboardLayout>
  );
}
