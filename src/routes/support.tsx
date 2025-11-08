import { createFileRoute } from '@tanstack/react-router';
import SupportComponent from '@/pages/Support/SupportComponent';

export const Route = createFileRoute('/support')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SupportComponent />;
}
