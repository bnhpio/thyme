import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalMutation, mutation } from '../_generated/server';

export const _saveCustomToken = internalMutation({
  args: {
    userId: v.id('users'),
    expiresAt: v.number(),
    organzations: v.array(v.id('organizations')),
    name: v.string(),
    tokenHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('userCustomTokens', {
      userId: args.userId,
      tokenHash: args.tokenHash,
      expiresAt: args.expiresAt,
      organzations: args.organzations,
      name: args.name,
    });
  },
});

export const deleteCustomToken = mutation({
  args: {
    id: v.id('userCustomTokens'),
  },
  handler: async (ctx, args) => {
    const token = await ctx.db.get(args.id);
    if (!token) {
      throw new Error('Token not found');
    }
    const userId = await getAuthUserId(ctx);
    if (token.userId !== userId) {
      throw new Error('Unauthorized');
    }
    await ctx.db.delete(args.id);
  },
});
