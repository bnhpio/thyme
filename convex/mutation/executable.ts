import { getAuthUserId } from '@convex-dev/auth/server';
import { Crons } from '@convex-dev/crons';
import { v } from 'convex/values';
import { components, internal } from '../_generated/api';
import { internalMutation } from '../_generated/server';

const crons = new Crons(components.crons);

export const createExecutable = internalMutation({
  args: {
    taskId: v.id('tasks'),
    name: v.string(),
    organizationId: v.id('organizations'),
    chainId: v.id('chains'),
    profileId: v.id('profiles'),
    args: v.string(),
    trigger: v.union(
      v.object({
        type: v.literal('cron'),
        schedule: v.string(),
        withRetry: v.boolean(),
        until: v.optional(v.number()),
      }),
      v.object({
        type: v.literal('single'),
        timestamp: v.number(),
        withRetry: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Verify user is a member of this organization
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('organizationId'), args.organizationId),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    if (!membership) {
      throw new Error('User is not a member of this organization');
    }

    // Verify task exists and belongs to organization
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    if (task.organizationId !== args.organizationId) {
      throw new Error('Task does not belong to this organization');
    }

    // Verify profile exists and belongs to organization
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    if (profile.organizationId !== args.organizationId) {
      throw new Error('Profile does not belong to this organization');
    }

    // Verify chain exists
    const chain = await ctx.db.get(args.chainId);
    if (!chain) {
      throw new Error('Chain not found');
    }

    const now = Date.now();

    const executable = await ctx.db.insert('executables', {
      taskId: args.taskId,
      name: args.name,
      organization: args.organizationId,
      createdBy: userId,
      chain: args.chainId,
      profile: args.profileId,
      args: args.args,
      trigger: args.trigger,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
    console.log('executable', executable, args.trigger.type);

    try {
      if (args.trigger.type === 'cron') {
        console.log('cron', executable.toString(), args.trigger.schedule);
        crons.register(
          ctx,
          { kind: 'cron', cronspec: args.trigger.schedule },
          internal.action.executable.runTask,
          { executableId: executable },
          executable.toString(),
        );
      }
    } catch (error) {
      console.error('error', error);
    }
    return { success: true };
  },
});
