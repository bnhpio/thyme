import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';

const CONVEX_URL = (import.meta as { env?: { VITE_CONVEX_URL?: string } }).env
  ?.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL');
}
// Create Convex client
export const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string,
);

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
