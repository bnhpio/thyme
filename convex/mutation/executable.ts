import { getAuthUserId } from '@convex-dev/auth/server';
import { Crons } from '@convex-dev/crons';
import { v } from 'convex/values';
import { components, internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import { internalMutation, type MutationCtx } from '../_generated/server';

const crons = new Crons(components.crons);

async function appendHistoryEntry(
  ctx: any,
  params: {
    executableId: Id<'executables'>;
    userId: Id<'users'>;
    change: 'register' | 'pause' | 'resume';
  },
) {
  await ctx.db.insert('executableHistory', {
    executableId: params.executableId,
    user: params.userId,
    change: params.change,
    timestamp: Date.now(),
  });
}

async function stopExecutableJobs(
  ctx: any,
  executableId: Id<'executables'>,
  executable: any,
) {
  if (executable.cronJobId) {
    try {
      await crons.delete(ctx, { id: executable.cronJobId });
    } catch (error) {
      try {
        await crons.delete(ctx, { name: executableId.toString() });
      } catch (nameError) {
        console.error(
          'Error deleting cron job by ID and name:',
          error,
          nameError,
        );
      }
    }
  }

  if (executable.schedulerJobId && executable.schedulerJobId !== 'pending') {
    try {
      await ctx.scheduler.cancel(executable.schedulerJobId);
    } catch (error) {
      console.error('Error canceling scheduled job:', error);
    }
  }
}

async function registerExecutableSchedule(
  ctx: MutationCtx,
  executableId: Id<'executables'>,
  trigger:
    | {
        type: 'cron';
        schedule: string;
      }
    | {
        type: 'interval';
        interval: number;
        startAt?: number | undefined;
      },
) {
  if (trigger.type === 'cron') {
    const cronJobId = await crons.register(
      ctx,
      { kind: 'cron', cronspec: trigger.schedule },
      internal.action.executable.runTask,
      { executableId },
      executableId.toString(),
    );
    const cronJob = await ctx.db.get(cronJobId as Id<any>);
    await ctx.db.patch(executableId, {
      cronJobId: cronJobId.toString(),
      schedulerJobId: cronJob?.schedulerJobId?.toString(),
    });
    return;
  }

  const schedulerJobId = await crons.register(
    ctx,
    { kind: 'interval', ms: trigger.interval * 1000 },
    internal.action.executable.runTask,
    { executableId },
    executableId.toString(),
  );

  await ctx.db.patch(executableId, {
    schedulerJobId: schedulerJobId.toString(),
  });
}

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
      const cronJob = await ctx.db.get(cronJobId as Id<any>);
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
    await appendHistoryEntry(ctx, {
      executableId: executable,
      userId,
      change: 'register',
    });
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
  returns: v.object({
    success: v.boolean(),
    reason: v.optional(v.string()),
  }),
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

    const hasWriteAccess = await ctx.runQuery(
      internal.query.organization.hasWriteAccessToOrganization,
      {
        organizationId: executable.organization,
        userId,
      },
    );
    if (!hasWriteAccess) {
      throw new Error('User does not have write access to this organization');
    }

    if (executable.status !== 'paused') {
      return {
        success: false,
        reason: 'Pause the executable before terminating it',
      };
    }

    await stopExecutableJobs(ctx, args.executableId, executable);

    // Remove executable from database
    await ctx.db.delete(args.executableId);

    return { success: true };
  },
});

export const pauseExecutable = internalMutation({
  args: {
    executableId: v.id('executables'),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const executable = await ctx.db.get(args.executableId);
    if (!executable) {
      throw new Error('Executable not found');
    }

    const hasWriteAccess = await ctx.runQuery(
      internal.query.organization.hasWriteAccessToOrganization,
      {
        organizationId: executable.organization,
        userId,
      },
    );
    if (!hasWriteAccess) {
      throw new Error('User does not have write access to this organization');
    }

    if (executable.status === 'paused') {
      return { success: false };
    }

    await stopExecutableJobs(ctx, args.executableId, executable);

    await ctx.db.patch(args.executableId, {
      status: 'paused',
      updatedAt: Date.now(),
    });

    await appendHistoryEntry(ctx, {
      executableId: args.executableId,
      userId,
      change: 'pause',
    });

    return { success: true };
  },
});

export const resumeExecutable = internalMutation({
  args: {
    executableId: v.id('executables'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const executable = await ctx.db.get(args.executableId);
    if (!executable) {
      throw new Error('Executable not found');
    }

    const hasWriteAccess = await ctx.runQuery(
      internal.query.organization.hasWriteAccessToOrganization,
      {
        organizationId: executable.organization,
        userId,
      },
    );
    if (!hasWriteAccess) {
      throw new Error('User does not have write access to this organization');
    }

    if (executable.status === 'active') {
      return { success: false };
    }

    await registerExecutableSchedule(
      ctx,
      args.executableId,
      executable.trigger,
    );

    await ctx.db.patch(args.executableId, {
      status: 'active',
      updatedAt: Date.now(),
    });

    await appendHistoryEntry(ctx, {
      executableId: args.executableId,
      userId,
      change: 'resume',
    });

    return { success: true };
  },
});

export const renameExecutable = internalMutation({
  args: {
    executableId: v.id('executables'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const executable = await ctx.db.get(args.executableId);
    if (!executable) {
      throw new Error('Executable not found');
    }

    const hasWriteAccess = await ctx.runQuery(
      internal.query.organization.hasWriteAccessToOrganization,
      {
        organizationId: executable.organization,
        userId,
      },
    );
    if (!hasWriteAccess) {
      throw new Error('User does not have write access to this organization');
    }

    if (!args.name || !args.name.trim()) {
      throw new Error('Name cannot be empty');
    }

    await ctx.db.patch(args.executableId, {
      name: args.name.trim(),
      updatedAt: Date.now(),
    });

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
          await crons.delete(ctx, { id: executable.cronJobId });
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

export const createExecution = internalMutation({
  args: {
    executableId: v.id('executables'),
  },
  returns: v.object({
    executionId: v.id('taskExecutions'),
  }),
  handler: async (ctx, args) => {
    const executionId = await ctx.db.insert('taskExecutions', {
      executableId: args.executableId,
      timestamp: Date.now(),
      status: 'pending',
      transactionHashes: [],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      cost: {
        gas: '0',
        gasPrice: '0',
        price: '0',
        userPrice: '0',
      },
    });
    return { executionId };
  },
});

export const startSimulation = internalMutation({
  args: {
    executionId: v.id('taskExecutions'),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }
    await ctx.db.patch(args.executionId, {
      status: 'simulation_pending',
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const failUnknownError = internalMutation({
  args: {
    executionId: v.id('taskExecutions'),
    errorReason: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }
    await ctx.db.patch(args.executionId, {
      status: 'failed',
      updatedAt: Date.now(),
      finishedAt: Date.now(),
    });
    return { success: true };
  },
});

export const failSimulation = internalMutation({
  args: {
    executionId: v.id('taskExecutions'),
    errorReason: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }
    await ctx.db.patch(args.executionId, {
      status: 'simulation_failed',
      updatedAt: Date.now(),
      finishedAt: Date.now(),
      errorReason: args.errorReason,
    });
    return { success: true };
  },
});

export const skipSimulation = internalMutation({
  args: {
    executionId: v.id('taskExecutions'),
    errorReason: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }
    await ctx.db.patch(args.executionId, {
      status: 'skipped',
      errorReason: args.errorReason,
      updatedAt: Date.now(),
      finishedAt: Date.now(),
    });
    return { success: true };
  },
});

export const startSending = internalMutation({
  args: {
    executionId: v.id('taskExecutions'),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }
    await ctx.db.patch(args.executionId, {
      status: 'sending',
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const startValidating = internalMutation({
  args: {
    executionId: v.id('taskExecutions'),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }
    await ctx.db.patch(args.executionId, {
      status: 'validating',
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const successSending = internalMutation({
  args: {
    executionId: v.id('taskExecutions'),
    transactionHashes: v.array(v.string()),
    cost: v.object({
      gas: v.string(),
      gasPrice: v.string(),
      price: v.string(),
      userPrice: v.string(),
    }),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }
    await ctx.db.patch(args.executionId, {
      status: 'success',
      updatedAt: Date.now(),
      finishedAt: Date.now(),
      transactionHashes: args.transactionHashes,
      cost: args.cost,
    });
    return { success: true };
  },
});

export const failSending = internalMutation({
  args: {
    executionId: v.id('taskExecutions'),
    transactionHashes: v.array(v.string()),
    cost: v.object({
      gas: v.string(),
      gasPrice: v.string(),
      price: v.string(),
      userPrice: v.string(),
    }),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }
    await ctx.db.patch(args.executionId, {
      status: 'sending_failed',
      updatedAt: Date.now(),
      finishedAt: Date.now(),
      transactionHashes: args.transactionHashes,
      cost: args.cost,
    });
    return { success: true };
  },
});
