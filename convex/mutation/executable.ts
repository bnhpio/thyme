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
      }),
      v.object({
        type: v.literal('interval'),
        interval: v.number(),
        startAt: v.optional(v.number()),
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

    if (args.trigger.type === 'cron') {
      // Register cron job using the crons component
      // The component handles the rescheduler pattern internally
      const cronJobId = await crons.register(
        ctx,
        { kind: 'cron', cronspec: args.trigger.schedule },
        internal.action.executable.runTask,
        { executableId: executable },
        executable.toString(),
      );
      // Fetch cron job to get schedulerJobId for tracking
      const cronJob = await (ctx.db as any).get(cronJobId);
      // Update executable with cron job ID and scheduler job ID
      await ctx.db.patch(executable, {
        cronJobId: cronJobId.toString(),
        schedulerJobId: cronJob?.schedulerJobId?.toString(),
      });
    } else if (args.trigger.type === 'interval') {
      // For interval executables, schedule them using the scheduler
      const interval = args.trigger.interval * 1000;

      // If startAt is provided and in the future, schedule first execution and then register interval
      // Otherwise, register the interval job immediately
      if (args.trigger.startAt) {
        const now = Date.now();
        const delay = Math.max(0, args.trigger.startAt - now);

        if (delay > 0) {
          // Schedule first execution at startAt, then register interval job
          // First, run the task at startAt
          await ctx.scheduler.runAfter(
            delay,
            internal.action.executable.runTask,
            { executableId: executable },
          );

          // Then register the interval job to start after the delay
          // Schedule a job to register the interval at startAt
          await ctx.scheduler.runAfter(
            delay,
            internal.mutation.executable.registerIntervalJob,
            {
              executableId: executable,
              interval,
            },
          );

          // Store placeholder - will be updated when interval is registered
          await ctx.db.patch(executable, {
            schedulerJobId: 'pending',
          });
        } else {
          // startAt is in the past or now, start immediately
          const schedulerJobId = await crons.register(
            ctx,
            { kind: 'interval', ms: interval },
            internal.action.executable.runTask,
            { executableId: executable },
            executable.toString(),
          );

          await ctx.db.patch(executable, {
            schedulerJobId: schedulerJobId.toString(),
          });
        }
      } else {
        // No startAt, start immediately
        const schedulerJobId = await crons.register(
          ctx,
          { kind: 'interval', ms: interval },
          internal.action.executable.runTask,
          { executableId: executable },
          executable.toString(),
        );

        await ctx.db.patch(executable, {
          schedulerJobId: schedulerJobId.toString(),
        });
      }
    }
    return { success: true };
  },
});

export const registerIntervalJob = internalMutation({
  args: {
    executableId: v.id('executables'),
    interval: v.number(),
  },
  handler: async (ctx, args) => {
    const executable = await ctx.db.get(args.executableId);
    if (!executable || executable.status !== 'active') {
      return;
    }

    // Register the interval job
    const schedulerJobId = await crons.register(
      ctx,
      { kind: 'interval', ms: args.interval },
      internal.action.executable.runTask,
      { executableId: args.executableId },
      args.executableId.toString(),
    );

    // Update executable with scheduler job ID
    await ctx.db.patch(args.executableId, {
      schedulerJobId: schedulerJobId.toString(),
    });
  },
});

export const terminateExecutable = internalMutation({
  args: {
    executableId: v.id('executables'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get executable
    const executable = await ctx.db.get(args.executableId);
    if (!executable) {
      throw new Error('Executable not found');
    }

    // Verify user is a member of this organization
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('organizationId'), executable.organization),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    if (!membership) {
      throw new Error('User is not a member of this organization');
    }

    // Stop cron job if it exists
    // According to https://www.convex.dev/components/crons, we can delete by name or id
    // We use the executable ID as the name when registering, so we can delete by name
    if (executable.cronJobId) {
      try {
        // Try deleting by ID first (more reliable)
        await crons.delete(ctx, { id: executable.cronJobId as any });
      } catch (error) {
        // If ID deletion fails, try by name as fallback
        try {
          await crons.delete(ctx, { name: args.executableId.toString() });
        } catch (nameError) {
          console.error(
            'Error deleting cron job by ID and name:',
            error,
            nameError,
          );
          // Continue with deletion even if cron deletion fails
        }
      }
    }

    // Cancel scheduled job if it exists (for interval executables)
    if (executable.schedulerJobId) {
      try {
        await ctx.scheduler.cancel(executable.schedulerJobId as any);
      } catch (error) {
        console.error('Error canceling scheduled job:', error);
        // Continue with deletion even if cancel fails
      }
    }

    // Remove executable from database
    await ctx.db.delete(args.executableId);

    return { success: true };
  },
});

// Internal mutation to mark executable as paused
// Used when cron expires (until timestamp reached)
export const markFinished = internalMutation({
  args: {
    executableId: v.id('executables'),
  },
  handler: async (ctx, args) => {
    const executable = await ctx.db.get(args.executableId);
    if (!executable) {
      return;
    }

    // Only update if still active
    if (executable.status === 'active') {
      // Stop the cron job
      // According to https://www.convex.dev/components/crons, we can delete by name or id
      if (executable.cronJobId) {
        try {
          // Try deleting by ID first (more reliable)
          await crons.delete(ctx, { id: executable.cronJobId as any });
        } catch (error) {
          // If ID deletion fails, try by name as fallback
          try {
            await crons.delete(ctx, { name: args.executableId.toString() });
          } catch (nameError) {
            console.error(
              'Error deleting cron job by ID and name:',
              error,
              nameError,
            );
          }
        }
      }

      // Pause the executable
      await ctx.db.patch(args.executableId, {
        status: 'paused',
        updatedAt: Date.now(),
      });
    }
  },
});
