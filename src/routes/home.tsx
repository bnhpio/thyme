import { createFileRoute } from '@tanstack/react-router';
import { Logo } from '@/components/base/Logo/Logo';

export const Route = createFileRoute('/home')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Logo />
    </div>
  );
}
