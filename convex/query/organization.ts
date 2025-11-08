import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { query } from '../_generated/server';

export const getOrganizationById = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

export const getOrganizationMembership = query({
  args: {
    organizationId: v.id('organizations'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('organizationId'), args.organizationId),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    return membership;
  },
});
