import { createServerFn } from '@tanstack/react-start';
import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server';
import { ConvexHttpClient } from 'convex/browser';
import { jwtDecode } from 'jwt-decode';

// Cookie names
const JWT_COOKIE = '__convexAuthJWT';
const REFRESH_COOKIE = '__convexAuthRefreshToken';
const VERIFIER_COOKIE = '__convexAuthOAuthVerifier';

// Cookie options
const getCookieOptions = (isSecure: boolean) =>
  ({
    path: '/',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
  }) as const;

/**
 * Server state for hydrating the client.
 */
export type ConvexAuthServerState = {
  _state: { token: string | null; refreshToken: string | null };
  _timeFetched: number;
};

/**
 * Get the Convex URL from environment.
 */
function getConvexUrl(): string {
  return process.env.VITE_CONVEX_URL || '';
}

/**
 * Check if we're on localhost (for cookie security settings).
 */
function isLocalhost(): boolean {
  // In server context, check common indicators
  const host = process.env.HOST || process.env.HOSTNAME || 'localhost';
  return host.includes('localhost') || host.includes('127.0.0.1');
}

/**
 * Get the current auth state from cookies.
 * Call this in your root loader to hydrate auth state.
 *
 * Note: Refresh token is never exposed to the client.
 * Token refresh happens server-side via refreshTokenAction.
 */
export const getAuthState = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ConvexAuthServerState> => {
    let token = getCookie(JWT_COOKIE) ?? null;
    const refreshToken = getCookie(REFRESH_COOKIE) ?? null;

    // Check if token needs refresh (do it server-side)
    if (token && refreshToken && isTokenExpiringSoon(token)) {
      try {
        const newTokens = await refreshTokensInternal(refreshToken);
        if (newTokens) {
          token = newTokens.token;
        }
      } catch {
        // If refresh fails, continue with current token
      }
    }

    return {
      _state: {
        token,
        // Never expose refresh token to client - refresh happens server-side
        refreshToken: null,
      },
      _timeFetched: Date.now(),
    };
  },
);

/**
 * Get the current auth token from cookies.
 * Use this in server functions that need the token.
 */
export const getAuthToken = createServerFn({ method: 'GET' }).handler(
  async (): Promise<string | null> => {
    return getCookie(JWT_COOKIE) ?? null;
  },
);

/**
 * Check if user is authenticated (has JWT cookie).
 * Use this in beforeLoad for protected routes.
 */
export const isAuthenticated = createServerFn({ method: 'GET' }).handler(
  async (): Promise<boolean> => {
    const token = getCookie(JWT_COOKIE);
    return !!token;
  },
);

/**
 * Server function to handle auth:signIn calls.
 * Manages OAuth flow, code exchange, and token refresh.
 */
export const signInAction = createServerFn({ method: 'POST' })
  .inputValidator((d: Record<string, unknown>) => d)
  .handler(
    async ({
      data,
    }): Promise<{
      redirect?: string;
      verifier?: string;
      tokens?: { token: string; refreshToken: string } | null;
    }> => {
      const { provider, params, verifier, refreshToken, code } = data as {
        provider?: string;
        params?: Record<string, unknown>;
        verifier?: string;
        refreshToken?: string;
        code?: string;
      };

      const convexUrl = getConvexUrl();
      const client = new ConvexHttpClient(convexUrl);
      const cookieOptions = getCookieOptions(!isLocalhost());

      // Case 1: Token refresh
      if (refreshToken) {
        try {
          const result = await client.action('auth:signIn' as any, {
            refreshToken,
          });
          if (result.tokens) {
            setCookie(JWT_COOKIE, result.tokens.token, cookieOptions);
            setCookie(
              REFRESH_COOKIE,
              result.tokens.refreshToken,
              cookieOptions,
            );
            return { tokens: result.tokens };
          }
          return { tokens: null };
        } catch (error) {
          console.error('[Auth] Token refresh failed:', error);
          // Clear invalid tokens
          deleteCookie(JWT_COOKIE, { path: '/' });
          deleteCookie(REFRESH_COOKIE, { path: '/' });
          return { tokens: null };
        }
      }

      // Case 2: OAuth code exchange
      if (code || (params && 'code' in params)) {
        const authCode = code || (params?.code as string);
        const storedVerifier = verifier || getCookie(VERIFIER_COOKIE);

        try {
          const result = await client.action('auth:signIn' as any, {
            params: { code: authCode },
            verifier: storedVerifier,
          });

          deleteCookie(VERIFIER_COOKIE, { path: '/' });

          if (result.tokens) {
            setCookie(JWT_COOKIE, result.tokens.token, cookieOptions);
            setCookie(
              REFRESH_COOKIE,
              result.tokens.refreshToken,
              cookieOptions,
            );
            return { tokens: result.tokens };
          }
          return { tokens: null };
        } catch (error) {
          console.error('[Auth] Code exchange failed:', error);
          deleteCookie(VERIFIER_COOKIE, { path: '/' });
          throw error;
        }
      }

      // Case 3: Initiate OAuth flow
      if (provider) {
        try {
          const result = await client.action('auth:signIn' as any, {
            provider,
            params,
          });

          if (result.redirect && result.verifier) {
            setCookie(VERIFIER_COOKIE, result.verifier, {
              ...cookieOptions,
              maxAge: 60 * 15, // 15 minutes
            });
            return { redirect: result.redirect, verifier: result.verifier };
          }

          // Direct sign-in (e.g., password auth)
          if (result.tokens) {
            setCookie(JWT_COOKIE, result.tokens.token, cookieOptions);
            setCookie(
              REFRESH_COOKIE,
              result.tokens.refreshToken,
              cookieOptions,
            );
            return { tokens: result.tokens };
          }

          return { tokens: null };
        } catch (error) {
          console.error('[Auth] Sign in failed:', error);
          throw error;
        }
      }

      return { tokens: null };
    },
  );

/**
 * Server function to handle auth:signOut calls.
 * Clears tokens from cookies and invalidates on server.
 */
export const signOutAction = createServerFn({ method: 'POST' }).handler(
  async (): Promise<void> => {
    const token = getCookie(JWT_COOKIE);
    const convexUrl = getConvexUrl();

    if (token) {
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
    deleteCookie(VERIFIER_COOKIE, { path: '/' });
  },
);

/**
 * Server function to refresh tokens.
 * Called automatically when token is expiring.
 */
export const refreshTokenAction = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{ token: string; refreshToken: string } | null> => {
    const refreshToken = getCookie(REFRESH_COOKIE);
    if (!refreshToken) {
      return null;
    }

    const result = await refreshTokensInternal(refreshToken);
    return result;
  },
);

// Internal helpers

const REQUIRED_TOKEN_LIFETIME_MS = 60_000; // 1 minute
const MINIMUM_REQUIRED_TOKEN_LIFETIME_MS = 10_000; // 10 seconds

/**
 * Check if token is expiring soon and needs refresh.
 */
function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp || !decoded.iat) return false;

    const totalLifetime = decoded.exp * 1000 - decoded.iat * 1000;
    const minExpiration =
      Date.now() +
      Math.min(
        REQUIRED_TOKEN_LIFETIME_MS,
        Math.max(MINIMUM_REQUIRED_TOKEN_LIFETIME_MS, totalLifetime / 10),
      );

    return decoded.exp * 1000 <= minExpiration;
  } catch {
    return false;
  }
}

/**
 * Internal function to refresh tokens via Convex.
 */
async function refreshTokensInternal(
  refreshToken: string,
): Promise<{ token: string; refreshToken: string } | null> {
  const convexUrl = getConvexUrl();
  const client = new ConvexHttpClient(convexUrl);
  const cookieOptions = getCookieOptions(!isLocalhost());

  try {
    const result = await client.action('auth:signIn' as any, { refreshToken });
    if (result.tokens) {
      setCookie(JWT_COOKIE, result.tokens.token, cookieOptions);
      setCookie(REFRESH_COOKIE, result.tokens.refreshToken, cookieOptions);
      return result.tokens;
    }
    return null;
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error);
    return null;
  }
}

export async function getServerConvex(): Promise<ConvexHttpClient> {
  const { getCookie } = await import('@tanstack/react-start/server');

  const token = getCookie('__convexAuthJWT') ?? undefined;
  const client = new ConvexHttpClient(getConvexUrl());

  if (token) {
    client.setAuth(token);
  }

  return client;
}
