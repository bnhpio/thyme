import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { action } from '../_generated/server';

export const createProfile = action({
  args: {
    organizationId: v.id('organizations'),
    alias: v.string(),
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
    const { encryptedPrivateKey, address } = await ctx.runAction(
      internal.action.node.createPrivateKey.default,
    );
    await ctx.runMutation(internal.mutation.profile.createProfile, {
      organizationId: args.organizationId,
      encryptedPrivateKey,
      alias: args.alias,
      address: address,
    });
  },
});
