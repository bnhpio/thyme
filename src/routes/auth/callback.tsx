import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server';
import { ConvexHttpClient } from 'convex/browser';

const VERIFIER_COOKIE = '__convexAuthOAuthVerifier';
const JWT_COOKIE = '__convexAuthJWT';
const REFRESH_COOKIE = '__convexAuthRefreshToken';

// Server function to exchange OAuth code for tokens
const exchangeCodeForTokens = createServerFn({ method: 'GET' })
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const { code } = data;
    const verifier = getCookie(VERIFIER_COOKIE);
    const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
    const client = new ConvexHttpClient(convexUrl);

    try {
      const result = await client.action('auth:signIn' as any, {
        params: { code },
        verifier,
      });

      deleteCookie(VERIFIER_COOKIE, { path: '/' });

      if (result.tokens) {
        setCookie(JWT_COOKIE, result.tokens.token, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
        });
        setCookie(REFRESH_COOKIE, result.tokens.refreshToken, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
        });
        return { success: true, token: result.tokens.token };
      }

      return { success: false, error: 'No tokens returned' };
    } catch (error) {
      console.error('[Auth Callback] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>) =>
    search && typeof search === 'object'
      ? {
          code: search.code as string | undefined,
          error: search.error as string | undefined,
        }
      : {},

  loaderDeps: ({ search }) => ({ code: search.code, error: search.error }),

  loader: async ({ deps }) => {
    const { code, error } = deps;

    if (error) {
      throw redirect({ to: '/login', search: { error } });
    }

    if (!code) {
      throw redirect({ to: '/login', search: { error: 'no_code' } });
    }

    // Exchange the code for tokens
    const result = await exchangeCodeForTokens({ data: { code } });

    if (!result.success) {
      throw redirect({
        to: '/login',
        search: { error: result.error || 'exchange_failed' },
      });
    }

    // Success - redirect to home
    throw redirect({ to: '/', search: { code: undefined, error: undefined } });
  },

  component: () => (
    <div className="flex items-center justify-center min-h-screen">
      <p>Completing sign in...</p>
    </div>
  ),
});
