import { v } from 'convex/values';
import { internalQuery } from '../_generated/server';

export const _isTokenExists = internalQuery({
  args: {
    tokenHash: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userCustomTokens')
      .withIndex('by_token_hash', (q) => q.eq('tokenHash', args.tokenHash))
      .first();
  },
});
