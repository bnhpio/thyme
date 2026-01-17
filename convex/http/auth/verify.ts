import { internal } from '../../_generated/api';
import { httpAction } from '../../_generated/server';
import { createJsonResponse, extractUserIdFromRequest } from '../utils';

export const verifyToken = httpAction(async (ctx, request) => {
  const result = await extractUserIdFromRequest(ctx, request);

  if ('error' in result) {
    return result.error;
  }

  const { userId } = result;

  // Get user information
  const user = await ctx.runQuery(internal.query.user._getUserById, {
    userId,
  });

  if (!user) {
    return createJsonResponse({ error: 'User not found' }, 404);
  }

  // Get user's organizations
  const organizations = await ctx.runQuery(
    internal.query.user._getUserOrganizations,
    { userId },
  );

  return createJsonResponse({
    user: {
      id: userId,
      name: user.name,
      email: user.email,
    },
    organizations: organizations.map((org) => ({
      id: org._id,
      name: org.name,
      role: org.role,
    })),
  });
});
