import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { deleteCookie, getCookie } from '@tanstack/react-start/server';
import { ConvexHttpClient } from 'convex/browser';

const JWT_COOKIE = '__convexAuthJWT';
const REFRESH_COOKIE = '__convexAuthRefreshToken';

// Server function to sign out
const performSignOut = createServerFn({ method: 'GET' }).handler(async () => {
  const token = getCookie(JWT_COOKIE);

  if (token) {
    const convexUrl = process.env.VITE_CONVEX_URL || '';
    const client = new ConvexHttpClient(convexUrl);
    client.setAuth(token);

    try {
      await client.action('auth:signOut' as any, {});
    } catch {
      // Ignore signout errors - we clear cookies anyway
    }
  }

  deleteCookie(JWT_COOKIE, { path: '/' });
  deleteCookie(REFRESH_COOKIE, { path: '/' });

  return { success: true };
});

export const Route = createFileRoute('/auth/signout')({
  loader: async () => {
    await performSignOut();
    throw redirect({ to: '/', search: { code: undefined, error: undefined } });
  },

  component: () => (
    <div className="flex items-center justify-center min-h-screen">
      <p>Signing out...</p>
    </div>
  ),
});
