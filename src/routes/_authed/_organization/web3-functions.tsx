import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Web3Functions } from '@/pages/Web3Functions/Web3Functions';

export const Route = createFileRoute('/_authed/_organization/web3-functions')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <Web3Functions />
    </DashboardLayout>
  );
}
