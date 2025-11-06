import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

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
