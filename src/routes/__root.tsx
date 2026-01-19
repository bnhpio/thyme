import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { ConvexReactClient } from 'convex/react';
import { NotFound } from '@/components/base/NotFound/NotFound';
import { AutumnWrapper } from '@/integrations/autumn/provider';
import { ConvexAuthTanstackProvider } from '@/lib/tanstack-auth';
import {
  getAuthState,
  refreshTokenAction,
  signInAction,
  signOutAction,
} from '@/lib/tanstack-auth/server';
import appCss from '../styles.css?url';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async () => {
    const serverState = await getAuthState();
    return { serverState };
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Thyme',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.svg',
      },
    ],
  }),
  shellComponent: RootDocument,
  ssr: true,
  notFoundComponent: () => <NotFound />,
});
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RootDocument({ children }: { children: React.ReactNode }) {
  const { serverState } = Route.useLoaderData();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ConvexAuthTanstackProvider
          client={convex}
          serverState={serverState}
          signInAction={(args) => signInAction({ data: args })}
          signOutAction={() => signOutAction()}
          refreshTokenAction={() => refreshTokenAction()}
          verbose
        >
          <AutumnWrapper>
            {children}
            {/* <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
              ]}
            /> */}
          </AutumnWrapper>
        </ConvexAuthTanstackProvider>
        <Scripts />
      </body>
    </html>
  );
}
