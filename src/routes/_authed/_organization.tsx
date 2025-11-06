import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/_organization')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
