import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { internalQuery, query } from '../_generated/server';

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

export const _getCustomTokensByUserId = internalQuery({
  args: {
    userId: v.id('users'),
  },
  returns: v.array(
    v.object({
      id: v.id('userCustomTokens'),
      expiresAt: v.number(),
      organzations: v.array(v.id('organizations')),
      name: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query('userCustomTokens')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    return tokens.map((token) => ({
      id: token._id,
      expiresAt: token.expiresAt,
      organzations: token.organzations,
      name: token.name,
    }));
  },
});

export const getCustomTokens = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const tokens = await ctx.db
      .query('userCustomTokens')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    return tokens.map((token) => ({
      id: token._id,
      expiresAt: token.expiresAt,
      organzations: token.organzations,
      name: token.name,
    }));
  },
});
