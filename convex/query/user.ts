import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { query } from '../_generated/server';
// Get current authenticated user info
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    // Get user data from the Convex users table
    const user = await ctx.db.get(userId);

    if (!user) {
      return null;
    }

    // Debug: Log the user data
    console.log('Convex user data:', JSON.stringify(user, null, 2));

    return {
      id: userId, // This is a proper Convex user ID
      name: user.name,
      email: user.email,
      image: user.image,
    };
  },
});

// Get user's organization membership (for specific user ID)
export const getUserOrganizations = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return {
          ...org,
          role: membership.role,
          joinedAt: membership.joinedAt,
        };
      }),
    );

    return organizations;
  },
});
