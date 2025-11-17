import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
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
      name: token.name,
    }));
  },
});

export const _getUserByCustomToken = internalQuery({
  args: {
    tokenHash: v.string(),
  },
  returns: v.id('users'),
  handler: async (ctx, args) => {
    const customToken = await ctx.db
      .query('userCustomTokens')
      .withIndex('by_token_hash', (q) => q.eq('tokenHash', args.tokenHash))
      .first();
    if (!customToken) {
      throw new Error('Invalid token');
    }
    return customToken.userId;
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
      name: token.name,
    }));
  },
});
