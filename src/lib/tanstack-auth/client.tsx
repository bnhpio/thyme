'use client';

import type { Value } from 'convex/values';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/**
 * Server state for hydrating the client from SSR.
 */
export type ConvexAuthServerState = {
  _state: { token: string | null; refreshToken: string | null };
  _timeFetched: number;
};

/**
 * Token storage interface (compatible with localStorage API).
 */
export interface TokenStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

/**
 * Auth actions context type.
 */
export interface ConvexAuthActionsContext {
  signIn: (
    provider?: string,
    args?: FormData | Record<string, Value>,
  ) => Promise<{ signingIn: boolean; redirect?: URL }>;
  signOut: () => Promise<void>;
}

// Contexts
const ConvexAuthActionsContextInternal =
  createContext<ConvexAuthActionsContext | null>(null);

const ConvexAuthInternalContext = createContext<{
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchAccessToken: (args: {
    forceRefreshToken: boolean;
  }) => Promise<string | null>;
} | null>(null);

const ConvexAuthTokenContext = createContext<string | null>(null);

// Storage keys
const VERIFIER_STORAGE_KEY = '__convexAuthOAuthVerifier';
const JWT_STORAGE_KEY = '__convexAuthJWT';
const REFRESH_TOKEN_STORAGE_KEY = '__convexAuthRefreshToken';
const SERVER_STATE_FETCH_TIME_STORAGE_KEY = '__convexAuthServerStateFetchTime';

/**
 * Hook to get auth state (isLoading, isAuthenticated, fetchAccessToken).
 */
export function useAuth() {
  const context = useContext(ConvexAuthInternalContext);
  if (!context) {
    throw new Error('useAuth must be used within ConvexAuthTanstackProvider');
  }
  return context;
}

/**
 * Hook to get auth actions (signIn, signOut).
 */
export function useAuthActions(): ConvexAuthActionsContext {
  const context = useContext(ConvexAuthActionsContextInternal);
  if (!context) {
    throw new Error(
      'useAuthActions must be used within ConvexAuthTanstackProvider',
    );
  }
  return context;
}

/**
 * Hook to get the current auth token.
 */
export function useAuthToken(): string | null {
  return useContext(ConvexAuthTokenContext);
}

/**
 * Hook to check if user is authenticated.
 */
export function useIsAuthenticated(): boolean {
  const token = useContext(ConvexAuthTokenContext);
  return token !== null;
}

/**
 * Hook to check if auth is loading.
 */
export function useAuthLoading(): boolean {
  const context = useContext(ConvexAuthInternalContext);
  return context?.isLoading ?? true;
}

/**
 * Props for the AuthProvider.
 */
interface AuthProviderProps {
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
  /** Server state from SSR */
  serverState?: ConvexAuthServerState;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom token storage (defaults to localStorage) */
  storage?: TokenStorage | null;
  /** Storage namespace for multiple apps */
  storageNamespace?: string;
  /** Function to replace URL without navigation */
  replaceURL?: (url: string) => void | Promise<void>;
  children: ReactNode;
}

/**
 * Internal auth provider with full token management.
 * Inspired by @convex-dev/auth/react but adapted for TanStack Start SSR.
 */
export function AuthProvider({
  signInAction,
  signOutAction,
  refreshTokenAction,
  serverState,
  verbose = false,
  storage,
  storageNamespace = '',
  replaceURL = (url) => window.history.replaceState({}, '', url),
  children,
}: AuthProviderProps) {
  const token = useRef<string | null>(serverState?._state.token ?? null);
  const [isLoading, setIsLoading] = useState(token.current === null);
  const [tokenState, setTokenState] = useState<string | null>(token.current);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  const logVerbose = useCallback(
    (message: string) => {
      if (verbose) {
        console.debug(`${new Date().toISOString()} [ConvexAuth] ${message}`);
      }
    },
    [verbose],
  );

  const { storageSet, storageGet, storageRemove, storageKey } =
    useNamespacedStorage(storage, storageNamespace);

  const setToken = useCallback(
    async (
      args:
        | { shouldStore: true; tokens: { token: string; refreshToken: string } }
        | { shouldStore: false; tokens: { token: string } }
        | { shouldStore: boolean; tokens: null },
    ) => {
      const wasAuthenticated = token.current !== null;
      let newToken: string | null;

      if (args.tokens === null) {
        token.current = null;
        if (args.shouldStore) {
          await storageRemove(JWT_STORAGE_KEY);
          await storageRemove(REFRESH_TOKEN_STORAGE_KEY);
        }
        newToken = null;
      } else {
        const { token: value } = args.tokens;
        token.current = value;
        if (args.shouldStore) {
          const { refreshToken } = args.tokens as {
            token: string;
            refreshToken: string;
          };
          await storageSet(JWT_STORAGE_KEY, value);
          await storageSet(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
        }
        newToken = value;
      }

      if (wasAuthenticated !== (newToken !== null)) {
        logVerbose(
          `Auth state changed: ${wasAuthenticated} -> ${newToken !== null}`,
        );
      }

      setTokenState(newToken);
      setIsLoading(false);
    },
    [storageSet, storageRemove, logVerbose],
  );

  // Warn before unload during token refresh
  useEffect(() => {
    const listener = (e: BeforeUnloadEvent) => {
      if (isRefreshingToken) {
        e.preventDefault();
        return 'Token refresh in progress';
      }
    };
    window.addEventListener?.('beforeunload', listener);
    return () => window.removeEventListener?.('beforeunload', listener);
  }, [isRefreshingToken]);

  // Cross-tab token sync via storage events
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === storageKey(JWT_STORAGE_KEY)) {
        const value = event.newValue;
        logVerbose(`Cross-tab token sync, is null: ${value === null}`);
        void setToken({
          shouldStore: false,
          tokens: value === null ? null : { token: value },
        });
      }
    };
    window.addEventListener?.('storage', listener);
    return () => window.removeEventListener?.('storage', listener);
  }, [setToken, storageKey, logVerbose]);

  const signIn = useCallback(
    async (
      provider?: string,
      args?: FormData | Record<string, Value>,
    ): Promise<{ signingIn: boolean; redirect?: URL }> => {
      const params =
        args instanceof FormData
          ? Object.fromEntries(args.entries())
          : (args ?? {});
      console.log('signIn');
      const verifier = (await storageGet(VERIFIER_STORAGE_KEY)) ?? undefined;
      await storageRemove(VERIFIER_STORAGE_KEY);

      const result = await signInAction({ provider, params, verifier });
      console.log(result, 'result');
      if (result.redirect !== undefined) {
        const url = new URL(result.redirect);

        console.log(url, 'url');
        await storageSet(VERIFIER_STORAGE_KEY, result.verifier!);
        // Redirect in browser (not React Native)
        if (
          typeof window !== 'undefined' &&
          navigator.product !== 'ReactNative'
        ) {
          window.location.href = url.toString();
        }
        return { signingIn: false, redirect: url };
      }
      if (result.tokens !== undefined) {
        const { tokens } = result;
        logVerbose(`Signed in, got tokens: ${tokens !== null}`);
        await setToken({ shouldStore: true, tokens: tokens ?? null });
        return { signingIn: result.tokens !== null };
      }

      return { signingIn: false };
    },
    [signInAction, setToken, storageGet, storageSet, storageRemove, logVerbose],
  );

  const signOut = useCallback(async () => {
    try {
      await signOutAction();
    } catch (error) {
      // Ignore errors - usually already signed out
      logVerbose(`Sign out error (ignored): ${error}`);
    }
    logVerbose('Signed out, clearing tokens');
    await setToken({ shouldStore: true, tokens: null });
  }, [signOutAction, setToken, logVerbose]);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (forceRefreshToken) {
        const tokenBeforeLock = token.current;

        return await browserMutex(REFRESH_TOKEN_STORAGE_KEY, async () => {
          const tokenAfterLock = token.current;
          // Another tab just refreshed
          if (tokenAfterLock !== tokenBeforeLock) {
            logVerbose('Using synced token from another tab');
            return tokenAfterLock;
          }

          // Call server function to refresh tokens (reads from httpOnly cookies)
          setIsRefreshingToken(true);
          try {
            const newTokens = await refreshTokenAction();
            if (newTokens) {
              logVerbose('Token refreshed successfully via server');
              await setToken({ shouldStore: true, tokens: newTokens });
              return token.current;
            }
            logVerbose('Server refresh returned no tokens');
            return null;
          } catch (error) {
            logVerbose(`Token refresh failed: ${error}`);
            return null;
          } finally {
            setIsRefreshingToken(false);
          }
        });
      }
      return token.current;
    },
    [refreshTokenAction, setToken, logVerbose],
  );

  // Initialize from storage or server state
  useEffect(() => {
    const readStateFromStorage = async () => {
      const storedToken = (await storageGet(JWT_STORAGE_KEY)) ?? null;
      logVerbose(`Read token from storage, is null: ${storedToken === null}`);
      await setToken({
        shouldStore: false,
        tokens: storedToken === null ? null : { token: storedToken },
      });
    };

    if (serverState !== undefined) {
      const setFromServerState = async () => {
        const timeFetched = await storageGet(
          SERVER_STATE_FETCH_TIME_STORAGE_KEY,
        );
        if (!timeFetched || serverState._timeFetched > +timeFetched) {
          const { token: serverToken } = serverState._state;

          await storageSet(
            SERVER_STATE_FETCH_TIME_STORAGE_KEY,
            serverState._timeFetched.toString(),
          );

          if (serverToken) {
            // Store only the JWT token (refresh token stays server-side in httpOnly cookies)
            await storageSet(JWT_STORAGE_KEY, serverToken);
            await setToken({
              shouldStore: false,
              tokens: { token: serverToken },
            });
          } else {
            await setToken({ shouldStore: true, tokens: null });
          }
          logVerbose('Initialized from server state');
        } else {
          await readStateFromStorage();
        }
      };
      void setFromServerState();
      return;
    }

    // Check for OAuth code in URL
    const code =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('code')
        : null;

    if (code) {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      void (async () => {
        await replaceURL(url.pathname + url.search + url.hash);
        await signIn(undefined, { code });
      })();
    } else {
      void readStateFromStorage();
    }
  }, [
    serverState,
    storageGet,
    storageSet,
    setToken,
    replaceURL,
    signIn,
    logVerbose,
  ]);

  const actions = useMemo(() => ({ signIn, signOut }), [signIn, signOut]);
  const isAuthenticated = tokenState !== null;
  const authState = useMemo(
    () => ({ isLoading, isAuthenticated, fetchAccessToken }),
    [isLoading, isAuthenticated, fetchAccessToken],
  );

  return (
    <ConvexAuthInternalContext.Provider value={authState}>
      <ConvexAuthActionsContextInternal.Provider value={actions}>
        <ConvexAuthTokenContext.Provider value={tokenState}>
          {children}
        </ConvexAuthTokenContext.Provider>
      </ConvexAuthActionsContextInternal.Provider>
    </ConvexAuthInternalContext.Provider>
  );
}

// Namespaced storage helpers
function useNamespacedStorage(
  storage: TokenStorage | null | undefined,
  namespace: string,
) {
  const inMemoryStorage = useInMemoryStorage();
  const actualStorage = useMemo(
    () =>
      storage ??
      (typeof window !== 'undefined' ? window.localStorage : inMemoryStorage()),
    [storage, inMemoryStorage],
  );
  const escapedNamespace = namespace.replace(/[^a-zA-Z0-9]/g, '');
  const storageKey = useCallback(
    (key: string) => (escapedNamespace ? `${key}_${escapedNamespace}` : key),
    [escapedNamespace],
  );
  const storageSet = useCallback(
    (key: string, value: string) =>
      actualStorage.setItem(storageKey(key), value),
    [actualStorage, storageKey],
  );
  const storageGet = useCallback(
    (key: string) => actualStorage.getItem(storageKey(key)),
    [actualStorage, storageKey],
  );
  const storageRemove = useCallback(
    (key: string) => actualStorage.removeItem(storageKey(key)),
    [actualStorage, storageKey],
  );
  return { storageSet, storageGet, storageRemove, storageKey };
}

function useInMemoryStorage() {
  const [inMemory, setInMemory] = useState<Record<string, string>>({});
  return useCallback(
    (): TokenStorage => ({
      getItem: (key) => inMemory[key] ?? null,
      setItem: (key, value) =>
        setInMemory((prev) => ({ ...prev, [key]: value })),
      removeItem: (key) =>
        setInMemory((prev) => {
          const { [key]: _, ...rest } = prev;
          return rest;
        }),
    }),
    [inMemory],
  );
}

// Browser mutex using navigator.locks or manual fallback
async function browserMutex<T>(
  key: string,
  callback: () => Promise<T>,
): Promise<T> {
  const lockManager =
    typeof window !== 'undefined' ? window.navigator?.locks : undefined;
  return lockManager !== undefined
    ? await lockManager.request(key, callback)
    : await callback();
}
