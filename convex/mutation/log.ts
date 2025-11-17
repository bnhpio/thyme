import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

export const log = internalMutation({
  args: {
    executableId: v.id('executables'),
    executionId: v.optional(v.id('taskExecutions')),
    log: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('taskLogs', {
      taskExecutableId: args.executableId,
      executionId: args.executionId,
      log: args.log,
      createdAt: Date.now(),
    });
  },
});
