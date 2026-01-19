'use client';

import { ConvexHttpClient } from 'convex/browser';
import { ConvexProviderWithAuth, type ConvexReactClient } from 'convex/react';
import { type ReactNode, useCallback, useMemo } from 'react';
import {
  AuthProvider,
  type ConvexAuthServerState,
  type TokenStorage,
  useAuth,
} from './client.js';

// Re-export client hooks and types
export {
  type ConvexAuthActionsContext,
  type ConvexAuthServerState,
  type TokenStorage,
  useAuth,
  useAuthActions,
  useAuthLoading,
  useAuthToken,
  useIsAuthenticated,
} from './client.js';

/**
 * Props for ConvexAuthTanstackProvider.
 */
interface ConvexAuthTanstackProviderProps {
  /** Convex React client instance */
  client: ConvexReactClient;
  /** Server state from SSR (from getAuthState) */
  serverState?: ConvexAuthServerState;
  /** Server function to call auth:signIn */
  signInAction: (args: Record<string, unknown>) => Promise<{
    redirect?: string;
    verifier?: string;
    tokens?: { token: string; refreshToken: string } | null;
  }>;
  /** Server function to call auth:signOut */
  signOutAction: () => Promise<void>;
  /** Server function to refresh tokens (reads from httpOnly cookies) */
  refreshTokenAction: () => Promise<{
    token: string;
    refreshToken: string;
  } | null>;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom token storage (defaults to localStorage) */
  storage?: TokenStorage | null;
  /** Storage namespace for multiple apps on same domain */
  storageNamespace?: string;
  children: ReactNode;
}

/**
 * Main provider for Convex Auth in TanStack Start applications.
 *
 * This provider combines:
 * - Full token management (refresh, cross-tab sync, retry logic)
 * - SSR support via serverState hydration
 * - Convex client integration with auth tokens
 *
 * @example
 * ```tsx
 * // In __root.tsx
 * import { ConvexReactClient } from "convex/react";
 * import { ConvexAuthTanstackProvider } from "tanstack-auth";
 * import { getAuthState, signInAction, signOutAction } from "tanstack-auth/server";
 *
 * const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
 *
 * export const Route = createRootRouteWithContext()({
 *   loader: async () => {
 *     const serverState = await getAuthState();
 *     return { serverState };
 *   },
 *   component: function RootComponent() {
 *     const { serverState } = Route.useLoaderData();
 *     return (
 *       <ConvexAuthTanstackProvider
 *         client={convex}
 *         serverState={serverState}
 *         signInAction={signInAction}
 *         signOutAction={signOutAction}
 *       >
 *         <Outlet />
 *       </ConvexAuthTanstackProvider>
 *     );
 *   },
 * });
 * ```
 */
export function ConvexAuthTanstackProvider({
  client,
  serverState,
  signInAction,
  signOutAction,
  refreshTokenAction,
  verbose = false,
  storage,
  storageNamespace = '',
  children,
}: ConvexAuthTanstackProviderProps) {
  return (
    <AuthProvider
      serverState={serverState}
      signInAction={signInAction}
      signOutAction={signOutAction}
      refreshTokenAction={refreshTokenAction}
      verbose={verbose}
      storage={storage}
      storageNamespace={storageNamespace}
    >
      <ConvexProviderWithToken client={client}>
        {children}
      </ConvexProviderWithToken>
    </AuthProvider>
  );
}

/**
 * Inner provider that connects Convex client with the auth token.
 */
function ConvexProviderWithToken({
  client,
  children,
}: {
  client: ConvexReactClient;
  children: ReactNode;
}) {
  const { isLoading, isAuthenticated, fetchAccessToken } = useAuth();

  // Create the auth state object for ConvexProviderWithAuth
  const authState = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      fetchAccessToken,
    }),
    [isLoading, isAuthenticated, fetchAccessToken],
  );

  // Create the useAuth hook that returns the memoized auth state
  const useAuthHook = useCallback(() => authState, [authState]);

  return (
    <ConvexProviderWithAuth client={client} useAuth={useAuthHook}>
      {children}
    </ConvexProviderWithAuth>
  );
}
