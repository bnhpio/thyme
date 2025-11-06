import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SettingsLayout } from '@/layouts/SettingsLayout';

export const Route = createFileRoute('/_authed/_settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  );
}
