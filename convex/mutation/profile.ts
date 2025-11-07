import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalMutation, mutation } from '../_generated/server';

export const createProfile = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    salt: v.string(),
    alias: v.string(),
    createdBy: v.id('users'),
    address: v.string(),
    chain: v.id('chains'),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('profiles', {
      organizationId: args.organizationId,
      salt: args.salt,
      alias: args.alias,
      address: args.address,
      createdBy: args.createdBy,
      chain: args.chain,
    });
  },
});

export const deleteProfile = mutation({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Verify user is a member of the organization
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('organizationId'), profile.organizationId),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    if (!membership) {
      throw new Error('User is not a member of this organization');
    }

    await ctx.db.delete(args.profileId);
    return { success: true };
  },
});
