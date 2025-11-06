import { createFileRoute } from '@tanstack/react-router';
import { Login } from '@/pages/Login/Login';

export const Route = createFileRoute('/login')({
  component: Login,
});
