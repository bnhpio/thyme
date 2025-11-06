import { createFileRoute } from '@tanstack/react-router';
import { ApiKeys } from '@/pages/ApiKeys/ApiKeys';

export const Route = createFileRoute('/_authed/_settings/settings/api-keys')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ApiKeys />;
}
