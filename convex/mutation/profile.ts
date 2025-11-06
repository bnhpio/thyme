import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

export const createProfile = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    encryptedPrivateKey: v.string(),
    alias: v.string(),
    createdBy: v.id('users'),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('profiles', {
      organizationId: args.organizationId,
      encryptedPrivateKey: args.encryptedPrivateKey,
      alias: args.alias,
      address: args.address,
      createdBy: args.createdBy,
    });
  },
});
