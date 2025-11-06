'use node';
import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { action } from '../_generated/server';

export const generateCustomToken = action({
  args: {
    organizations: v.array(v.id('organizations')),
    name: v.string(),
    expiresAt: v.number(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    let token = '';
    let tokenExists = true;
    let tokenHash = '';
    while (tokenExists) {
      token = await ctx.runAction(
        internal.action.node.customToken._generateRandomToken,
      );
      tokenHash = await ctx.runAction(
        internal.action.node.customToken._hashToken,
        {
          token: token,
        },
      );
      const existing = await ctx.runQuery(
        internal.query.customToken._isTokenExists,
        {
          tokenHash: tokenHash,
        },
      );
      tokenExists = !!existing;
    }
    if (token === '' || tokenHash === '') {
      throw new Error('Failed to generate token');
    }
    await ctx.runMutation(internal.mutation.customToken._saveCustomToken, {
      userId: userId,
      expiresAt: args.expiresAt,
      organzations: args.organizations,
      name: args.name,
      tokenHash: tokenHash,
    });

    return token;
  },
});
