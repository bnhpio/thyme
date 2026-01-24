import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalQuery, query } from '../_generated/server';

export const getExecutablesByOrganization = query({
  args: {
    organizationId: v.id('organizations'),
    filters: v.optional(
      v.object({
        status: v.optional(v.union(v.literal('active'), v.literal('paused'))),
        chainId: v.optional(v.id('chains')),
        profileId: v.optional(v.id('profiles')),
        triggerType: v.optional(
          v.union(v.literal('interval'), v.literal('cron')),
        ),
      }),
    ),
  },
  returns: v.array(
    v.object({
      id: v.id('executables'),
      taskId: v.id('tasks'),
      name: v.string(),
      updatedAt: v.number(),
      createdAt: v.number(),
      createdBy: v.optional(
        v.object({
          id: v.id('users'),
          name: v.string(),
        }),
      ),
      status: v.union(v.literal('active'), v.literal('paused')),
      chain: v.object({
        id: v.id('chains'),
        chainId: v.number(),
        explorerUrl: v.optional(v.string()),
      }),
      args: v.string(),
      taskStorageId: v.optional(v.id('_storage')),
      profile: v.object({
        id: v.id('profiles'),
        alias: v.string(),
        address: v.optional(v.string()),
      }),
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
      runs: v.number(),
      executions: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    let executables = await ctx.db
      .query('executables')
      .withIndex('by_organization', (q) =>
        q.eq('organization', args.organizationId),
      )
      .collect();

    // Apply filters
    if (args.filters) {
      if (args.filters.status) {
        executables = executables.filter(
          (e) => e.status === args.filters?.status,
        );
      }
      if (args.filters.chainId) {
        executables = executables.filter(
          (e) => e.chain === args.filters?.chainId,
        );
      }
      if (args.filters.profileId) {
        executables = executables.filter(
          (e) => e.profile === args.filters?.profileId,
        );
      }
      if (args.filters.triggerType) {
        executables = executables.filter(
          (e) => e.trigger.type === args.filters?.triggerType,
        );
      }
    }

    return await Promise.all(
      executables.map(async (executable) => {
        const user = await ctx.db.get(executable.createdBy);
        const chain = await ctx.db.get(executable.chain);
        const profile = await ctx.db.get(executable.profile);
        const task = await ctx.db.get(executable.taskId);

        // Count executions for this executable
        const executions = await ctx.db
          .query('taskExecutions')
          .withIndex('by_executable', (q) =>
            q.eq('executableId', executable._id),
          )
          .collect();

        // Runs = total executions, Executions = successful executions
        const runs = executions.length;
        const successfulExecutions = executions.filter(
          (e) => e.status === 'success',
        ).length;

        return {
          id: executable._id,
          taskId: executable.taskId,
          name: executable.name,
          updatedAt: executable.updatedAt,
          createdAt: executable.createdAt,
          createdBy: user
            ? {
                id: user._id,
                name: user.name ?? 'Unknown',
              }
            : undefined,
          status: executable.status,
          chain: {
            id: chain?._id ?? executable.chain,
            chainId: chain?.chainId ?? 0,
            explorerUrl: chain?.explorerUrl,
          },
          args: executable.args,
          taskStorageId: task?.hash,
          profile: {
            id: profile?._id ?? executable.profile,
            alias: profile?.alias ?? 'Unknown',
            address: profile?.address,
          },
          trigger: executable.trigger,
          runs,
          executions: successfulExecutions,
        };
      }),
    );
  },
});

export const getExecutableStats = query({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.object({
    total: v.number(),
    active: v.number(),
    paused: v.number(),
    mainnet: v.number(),
    testnet: v.number(),
  }),
  handler: async (ctx, args) => {
    const executables = await ctx.db
      .query('executables')
      .withIndex('by_organization', (q) =>
        q.eq('organization', args.organizationId),
      )
      .collect();

    let mainnet = 0;
    let testnet = 0;
    const statusCounts = {
      active: 0,
      paused: 0,
    };

    for (const executable of executables) {
      if (executable.status === 'active') {
        statusCounts.active++;
      } else {
        statusCounts.paused++;
      }

      const chain = await ctx.db.get(executable.chain);
      if (chain) {
        // Mainnet chains typically have chainId 1, 137, 42161, 10, 8453, 56, 43114, 250
        const mainnetChainIds = [1, 137, 42161, 10, 8453, 56, 43114, 250];
        if (mainnetChainIds.includes(chain.chainId)) {
          mainnet++;
        } else {
          testnet++;
        }
      }
    }

    return {
      total: executables.length,
      active: statusCounts.active,
      paused: statusCounts.paused,
      mainnet,
      testnet,
    };
  },
});

export const getExecutableById = query({
  args: {
    executableId: v.id('executables'),
  },
  returns: v.union(
    v.object({
      id: v.id('executables'),
      taskId: v.id('tasks'),
      name: v.string(),
      updatedAt: v.number(),
      createdAt: v.number(),
      createdBy: v.optional(
        v.object({
          id: v.id('users'),
          name: v.string(),
        }),
      ),
      status: v.union(v.literal('active'), v.literal('paused')),
      chain: v.object({
        id: v.id('chains'),
        chainId: v.number(),
        explorerUrl: v.optional(v.string()),
      }),
      args: v.string(),
      taskStorageId: v.optional(v.id('_storage')),
      profile: v.object({
        id: v.id('profiles'),
        alias: v.string(),
        address: v.optional(v.string()),
      }),
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
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const executable = await ctx.db.get(args.executableId);
    if (!executable) {
      return null;
    }

    const user = await ctx.db.get(executable.createdBy);
    const chain = await ctx.db.get(executable.chain);
    const profile = await ctx.db.get(executable.profile);
    const task = await ctx.db.get(executable.taskId);

    return {
      id: executable._id,
      taskId: executable.taskId,
      name: executable.name,
      updatedAt: executable.updatedAt,
      createdAt: executable.createdAt,
      createdBy: user
        ? {
            id: user._id,
            name: user.name ?? 'Unknown',
          }
        : undefined,
      status: executable.status,
      chain: {
        id: chain?._id ?? executable.chain,
        chainId: chain?.chainId ?? 0,
        explorerUrl: chain?.explorerUrl,
      },
      args: executable.args,
      taskStorageId: task?.hash,
      profile: {
        id: profile?._id ?? executable.profile,
        alias: profile?.alias ?? 'Unknown',
        address: profile?.address,
      },
      trigger: executable.trigger,
    };
  },
});

export const getExecutableByIdInternal = internalQuery({
  args: {
    executableId: v.id('executables'),
  },
  handler: async (ctx, args) => {
    const executable = await ctx.db.get(args.executableId);
    if (!executable) {
      return null;
    }

    return {
      _id: executable._id,
      taskId: executable.taskId,
      name: executable.name,
      organization: executable.organization,
      createdBy: executable.createdBy,
      chain: executable.chain,
      profile: executable.profile,
      args: executable.args,
      trigger: executable.trigger,
      status: executable.status,
      createdAt: executable.createdAt,
      updatedAt: executable.updatedAt,
    };
  },
});

export const getExecutableLogs = query({
  args: {
    executableId: v.id('executables'),
    executionId: v.optional(v.id('taskExecutions')),
  },
  returns: v.array(
    v.object({
      id: v.id('taskLogs'),
      taskExecutableId: v.id('executables'),
      log: v.any(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get executable to check organization
    const executable = await ctx.db.get(args.executableId);
    if (!executable) {
      throw new Error('Executable not found');
    }

    // Verify user is a member of the organization
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

    // Get logs for this executable, optionally filtered by execution
    let logs: Array<{
      _id: any;
      taskExecutableId: any;
      executionId?: any;
      log: any;
      createdAt: number;
    }>;
    if (args.executionId) {
      logs = await ctx.db
        .query('taskLogs')
        .withIndex('by_execution', (q) => q.eq('executionId', args.executionId))
        .filter((q) => q.eq(q.field('taskExecutableId'), args.executableId))
        .order('desc')
        .collect();
    } else {
      logs = await ctx.db
        .query('taskLogs')
        .withIndex('by_executable', (q) =>
          q.eq('taskExecutableId', args.executableId),
        )
        .order('desc')
        .collect();
    }

    return logs.map((log) => ({
      id: log._id,
      taskExecutableId: log.taskExecutableId,
      log: log.log,
      createdAt: log.createdAt,
    }));
  },
});

export const getExecutableHistory = query({
  args: {
    executableId: v.id('executables'),
  },
  returns: v.array(
    v.object({
      id: v.id('executableHistory'),
      change: v.union(
        v.literal('register'),
        v.literal('pause'),
        v.literal('resume'),
      ),
      timestamp: v.number(),
      user: v.optional(
        v.object({
          id: v.id('users'),
          name: v.string(),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const executable = await ctx.db.get(args.executableId);
    if (!executable) {
      throw new Error('Executable not found');
    }

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

    const history = await ctx.db
      .query('executableHistory')
      .withIndex('by_executable', (q) =>
        q.eq('executableId', args.executableId),
      )
      .order('desc')
      .collect();

    return Promise.all(
      history.map(async (entry) => {
        const historyUser = await ctx.db.get(entry.user);
        return {
          id: entry._id,
          change: entry.change,
          timestamp: entry.timestamp,
          user: historyUser
            ? {
                id: historyUser._id,
                name: historyUser.name ?? 'Unknown',
              }
            : undefined,
        };
      }),
    );
  },
});

export const getExecutionsByExecutableId = query({
  args: {
    executableId: v.id('executables'),
  },
  returns: v.array(
    v.object({
      id: v.id('taskExecutions'),
      status: v.union(
        v.literal('pending'),
        v.literal('skipped'),
        v.literal('simulation_pending'),
        v.literal('simulation_failed'),
        v.literal('sending'),
        v.literal('validating'),
        v.literal('success'),
        v.literal('sending_failed'),
        v.literal('failed'),
      ),
      transactionHashes: v.array(v.string()),
      startedAt: v.number(),
      updatedAt: v.number(),
      finishedAt: v.optional(v.number()),
      errorReason: v.optional(v.string()),
      cost: v.object({
        gas: v.string(),
        gasPrice: v.string(),
        price: v.string(),
        userPrice: v.string(),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    const executions = await ctx.db
      .query('taskExecutions')
      .withIndex('by_executable', (q) =>
        q.eq('executableId', args.executableId),
      )
      .collect();
    return executions
      .map((execution) => ({
        id: execution._id,
        status: execution.status,
        transactionHashes: execution.transactionHashes,
        startedAt: execution.startedAt,
        updatedAt: execution.updatedAt,
        finishedAt: execution.finishedAt,
        errorReason: execution.errorReason,
        cost: execution.cost,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
