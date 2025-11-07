import { v } from 'convex/values';
import { internalQuery, query } from '../_generated/server';

export const getExecutablesByOrganization = query({
  args: {
    organizationId: v.id('organizations'),
    filters: v.optional(
      v.object({
        status: v.optional(
          v.union(
            v.literal('active'),
            v.literal('paused'),
            v.literal('finished'),
            v.literal('failed'),
          ),
        ),
        chainId: v.optional(v.id('chains')),
        profileId: v.optional(v.id('profiles')),
        triggerType: v.optional(
          v.union(v.literal('single'), v.literal('cron')),
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
      status: v.union(
        v.literal('active'),
        v.literal('paused'),
        v.literal('finished'),
        v.literal('failed'),
      ),
      chain: v.object({
        id: v.id('chains'),
        chainId: v.number(),
      }),
      args: v.string(),
      profile: v.object({
        id: v.id('profiles'),
        alias: v.string(),
      }),
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
            id: chain?._id ?? (executable.chain as any),
            chainId: chain?.chainId ?? 0,
          },
          args: executable.args,
          profile: {
            id: profile?._id ?? (executable.profile as any),
            alias: profile?.alias ?? 'Unknown',
          },
          trigger: executable.trigger,
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
    finished: v.number(),
    failed: v.number(),
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
      finished: 0,
      failed: 0,
    };

    for (const executable of executables) {
      statusCounts[executable.status]++;

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
      finished: statusCounts.finished,
      failed: statusCounts.failed,
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
      status: v.union(
        v.literal('active'),
        v.literal('paused'),
        v.literal('finished'),
        v.literal('failed'),
      ),
      chain: v.object({
        id: v.id('chains'),
        chainId: v.number(),
      }),
      args: v.string(),
      profile: v.object({
        id: v.id('profiles'),
        alias: v.string(),
      }),
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
        id: chain?._id ?? (executable.chain as any),
        chainId: chain?.chainId ?? 0,
      },
      args: executable.args,
      profile: {
        id: profile?._id ?? (executable.profile as any),
        alias: profile?.alias ?? 'Unknown',
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
