import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { setCookie } from '@tanstack/react-start/server';
import { ConvexHttpClient } from 'convex/browser';

const VERIFIER_COOKIE = '__convexAuthOAuthVerifier';

// Server function to initiate OAuth
const initiateOAuth = createServerFn({ method: 'GET' })
  .inputValidator((d: { provider: string }) => d)
  .handler(async ({ data }) => {
    const { provider } = data;
    const convexUrl = process.env.VITE_CONVEX_URL || '';
    const client = new ConvexHttpClient(convexUrl);

    try {
      const result = await client.action('auth:signIn' as any, {
        provider,
      });

      if (result.redirect && result.verifier) {
        setCookie(VERIFIER_COOKIE, result.verifier, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 15,
        });
        return { redirect: result.redirect };
      }

      return { error: 'No redirect URL returned' };
    } catch (error) {
      console.error('[Auth SignIn] Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

export const Route = createFileRoute('/auth/signin/$provider')({
  loader: async ({ params }) => {
    const { provider } = params;

    const result = await initiateOAuth({ data: { provider } });

    if (result.error) {
      throw redirect({ to: '/login', search: { error: result.error } });
    }

    if (result.redirect) {
      // Redirect to OAuth provider
      throw redirect({ href: result.redirect });
    }

    throw redirect({ to: '/login', search: { error: 'no_redirect' } });
  },

  component: () => (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to sign in...</p>
    </div>
  ),
});
