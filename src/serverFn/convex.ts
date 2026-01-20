import { createServerFn } from '@tanstack/react-start';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import z from 'zod';
import { getServerConvexClient } from './utils';

export const getCurrentUser = createServerFn().handler(async () => {
  const client = await getServerConvexClient();
  const user = await client.query(api.query.user.getCurrentUser);
  return user;
});

export const getUserOrganizations = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const client = await getServerConvexClient();
    const organizations = await client.query(
      api.query.user.getUserOrganizations,
      { userId: data.userId as Id<'users'> },
    );
    return organizations;
  });
