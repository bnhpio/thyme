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

// Check if user has pending invites
export const getUserPendingInvites = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const invites = await ctx.db
      .query('organizationInvites')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'pending'),
          q.gt(q.field('expiresAt'), Date.now()),
        ),
      )
      .collect();

    const invitesWithOrg = await Promise.all(
      invites.map(async (invite) => {
        const org = await ctx.db.get(invite.organizationId);
        return {
          ...invite,
          organization: org,
        };
      }),
    );

    return invitesWithOrg;
  },
});

// Get user's current organization ID from settings
export const getCurrentUserOrganizationId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    return settings?.currentOrganizationId || null;
  },
});

export const getUserSettings = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    return settings;
  },
});
