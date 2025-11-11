import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

export const log = internalMutation({
  args: {
    executableId: v.id('executables'),
    log: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('taskLogs', {
      taskExecutableId: args.executableId,
      log: args.log,
      createdAt: Date.now(),
      type: 'info',
    });
  },
});

export const warn = internalMutation({
  args: {
    executableId: v.id('executables'),
    log: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('taskLogs', {
      taskExecutableId: args.executableId,
      log: args.log,
      createdAt: Date.now(),
      type: 'warn',
    });
  },
});

export const error = internalMutation({
  args: {
    executableId: v.id('executables'),
    log: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('taskLogs', {
      taskExecutableId: args.executableId,
      log: args.log,
      createdAt: Date.now(),
      type: 'error',
    });
  },
});
