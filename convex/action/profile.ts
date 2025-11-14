import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { action, internalAction } from '../_generated/server';

export const createProfile = action({
  args: {
    organizationId: v.id('organizations'),
    alias: v.string(),
    chain: v.id('chains'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    await ctx.runAction(internal.action.profile._createProfile, {
      userId: userId,
      organizationId: args.organizationId,
      alias: args.alias,
      chain: args.chain,
    });
  },
});

export const _createProfile = internalAction({
  args: {
    organizationId: v.id('organizations'),
    alias: v.string(),
    userId: v.id('users'),
    chain: v.id('chains'),
  },
  handler: async (ctx, args) => {
    const existingProfileWithSameAlias = await ctx.runQuery(
      internal.query.profile.getProfileByOrganizationAndAlias,
      {
        organizationId: args.organizationId,
        alias: args.alias,
      },
    );
    if (existingProfileWithSameAlias) {
      throw new Error('Profile with same alias already exists');
    }
    const salt = btoa(args.alias).concat(args.organizationId.toString());

    const chain = await ctx.runQuery(internal.query.chain.getChainById, {
      chainId: args.chain,
    });

    const { address } = await ctx.runAction(
      internal.action.node.createSmartAccount.default,
      {
        chain: chain.chainId,
        salt,
      },
    );
    await ctx.runMutation(internal.mutation.profile.createProfile, {
      organizationId: args.organizationId,
      salt: salt,
      chain: args.chain,
      alias: args.alias,
      address: address,
      createdBy: args.userId,
    });
  },
});
