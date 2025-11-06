import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

export const createTask = internalMutation({
  args: {
    storageId: v.id('_storage'),
    organizationId: v.optional(v.id('organizations')),
    checkSum: v.string(),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('tasks', {
      hash: args.storageId,
      organizationId: args.organizationId,
      checkSum: args.checkSum,
      creator: args.userId,
    });
  },
});
