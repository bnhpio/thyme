import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalQuery, query } from '../_generated/server';

// Internal query to get user by ID
export const _getUserById = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Internal query to get user's organizations
export const _getUserOrganizations = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    const organizations = [];
    for (const membership of memberships) {
      const org = await ctx.db.get(membership.organizationId);
      // Filter out deleted organizations
      if (org) {
        organizations.push({
          ...org,
          role: membership.role,
          joinedAt: membership.joinedAt,
        });
      }
    }

    return organizations;
  },
});

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

    const organizations = [];
    for (const membership of memberships) {
      const org = await ctx.db.get(membership.organizationId);
      // Filter out deleted organizations
      if (org) {
        organizations.push({
          ...org,
          role: membership.role,
          joinedAt: membership.joinedAt,
        });
      }
    }

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

    // Enrich with organization and inviter details
    const invitesWithDetails = [];
    for (const invite of invites) {
      const org = await ctx.db.get(invite.organizationId);
      const inviter = await ctx.db.get(invite.invitedBy);

      invitesWithDetails.push({
        ...invite,
        organization: org,
        inviter: inviter
          ? {
              id: inviter._id,
              name: inviter.name,
              email: inviter.email,
            }
          : null,
      });
    }

    return invitesWithDetails;
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

    const currentOrgId = settings?.currentOrganizationId;
    if (!currentOrgId) {
      return null;
    }

    // Verify the organization still exists
    const org = await ctx.db.get(currentOrgId);
    if (!org) {
      // Organization was deleted, return null
      // The frontend will handle cleanup via auto-selection
      return null;
    }

    // Verify user is still a member
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('organizationId'), currentOrgId),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    if (!membership) {
      // User is no longer a member, return null
      // The frontend will handle cleanup via auto-selection
      return null;
    }

    return currentOrgId;
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

export const getUserTheme = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
    return settings?.preferences?.theme;
  },
});
