import { getCookie } from '@tanstack/react-start/server';
import { ConvexHttpClient } from 'convex/browser';

export const getServerConvexClient = async () => {
  const token = getCookie('__convexAuthJWT') ?? undefined;

  const convexUrl = process.env.VITE_CONVEX_URL || '';
  const client = new ConvexHttpClient(convexUrl);

  if (token) {
    client.setAuth(token);
  }

  return client;
};
