import { createFileRoute } from '@tanstack/react-router';
import { Logo } from '@/components/base/Logo/Logo';

export const Route = createFileRoute('/home')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div className="size-4">
        <Logo />
      </div>
    </div>
  );
}
