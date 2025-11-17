import { v } from 'convex/values';
import { query } from '../_generated/server';

// Shared chain configuration
const MAINNET_CHAIN_IDS = [1, 137, 42161, 10, 8453, 56, 43114, 250, 130];

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli',
  11155111: 'Ethereum Sepolia',
  137: 'Polygon',
  42161: 'Arbitrum One',
  421613: 'Arbitrum Goerli',
  10: 'Optimism',
  420: 'Optimism Goerli',
  8453: 'Base',
  84531: 'Base Goerli',
  56: 'BNB Chain',
  97: 'BNB Testnet',
  43114: 'Avalanche',
  43113: 'Avalanche Fuji',
  250: 'Fantom',
  4002: 'Fantom Testnet',
  130: 'Unichain Mainnet',
  1301: 'Unichain Sepolia',
};

export const getDashboardOverview = query({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.object({
    totalExecutables: v.number(),
    activeExecutables: v.number(),
    pausedExecutables: v.number(),
    recentlyCreated: v.number(),
    recentlyUpdated: v.number(),
  }),
  handler: async (ctx, args) => {
    const executables = await ctx.db
      .query('executables')
      .withIndex('by_organization', (q) =>
        q.eq('organization', args.organizationId),
      )
      .collect();

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const statusCounts = {
      active: 0,
      paused: 0,
    };

    let recentlyCreated = 0;
    let recentlyUpdated = 0;

    for (const executable of executables) {
      if (executable.status === 'active') {
        statusCounts.active++;
      } else {
        statusCounts.paused++;
      }

      if (executable.createdAt >= sevenDaysAgo) {
        recentlyCreated++;
      }

      if (executable.updatedAt >= sevenDaysAgo) {
        recentlyUpdated++;
      }
    }

    return {
      totalExecutables: executables.length,
      activeExecutables: statusCounts.active,
      pausedExecutables: statusCounts.paused,
      recentlyCreated,
      recentlyUpdated,
    };
  },
});

export const getExecutablesByChain = query({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.array(
    v.object({
      chainId: v.number(),
      chainName: v.string(),
      count: v.number(),
      activeCount: v.number(),
      isMainnet: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const executables = await ctx.db
      .query('executables')
      .withIndex('by_organization', (q) =>
        q.eq('organization', args.organizationId),
      )
      .collect();

    const chainMap = new Map<
      string,
      {
        chainId: number;
        chainName: string;
        count: number;
        activeCount: number;
        isMainnet: boolean;
      }
    >();

    for (const executable of executables) {
      const chain = await ctx.db.get(executable.chain);
      if (!chain) continue;

      const chainKey = chain._id.toString();
      const isMainnet = MAINNET_CHAIN_IDS.includes(chain.chainId);
      const chainName =
        CHAIN_NAMES[chain.chainId as keyof typeof CHAIN_NAMES] ||
        `Chain ${chain.chainId}`;

      if (!chainMap.has(chainKey)) {
        chainMap.set(chainKey, {
          chainId: chain.chainId,
          chainName,
          count: 0,
          activeCount: 0,
          isMainnet,
        });
      }

      const chainData = chainMap.get(chainKey);
      if (chainData) {
        chainData.count++;
        if (executable.status === 'active') {
          chainData.activeCount++;
        }
      }
    }

    return Array.from(chainMap.values()).sort((a, b) => b.count - a.count);
  },
});

export const getRecentExecutables = query({
  args: {
    organizationId: v.id('organizations'),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      id: v.id('executables'),
      name: v.string(),
      status: v.union(v.literal('active'), v.literal('paused')),
      updatedAt: v.number(),
      createdAt: v.number(),
      chain: v.object({
        id: v.id('chains'),
        chainId: v.number(),
        name: v.string(),
        isMainnet: v.boolean(),
      }),
      profile: v.object({
        id: v.id('profiles'),
        alias: v.string(),
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
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const executables = await ctx.db
      .query('executables')
      .withIndex('by_organization', (q) =>
        q.eq('organization', args.organizationId),
      )
      .collect();

    // Sort by updatedAt DESC
    executables.sort((a, b) => b.updatedAt - a.updatedAt);

    const result = await Promise.all(
      executables.slice(0, limit).map(async (executable) => {
        const chain = await ctx.db.get(executable.chain);
        const profile = await ctx.db.get(executable.profile);

        if (!chain || !profile) {
          return null;
        }

        const chainName =
          CHAIN_NAMES[chain.chainId as keyof typeof CHAIN_NAMES] ||
          `Chain ${chain.chainId}`;
        const isMainnet = MAINNET_CHAIN_IDS.includes(chain.chainId);

        return {
          id: executable._id,
          name: executable.name,
          status: executable.status,
          updatedAt: executable.updatedAt,
          createdAt: executable.createdAt,
          chain: {
            id: chain._id,
            chainId: chain.chainId,
            name: chainName,
            isMainnet,
          },
          profile: {
            id: profile._id,
            alias: profile.alias,
          },
          trigger: executable.trigger,
        };
      }),
    );

    return result.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );
  },
});

export const getTopExecutables = query({
  args: {
    organizationId: v.id('organizations'),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      id: v.id('executables'),
      name: v.string(),
      status: v.union(v.literal('active'), v.literal('paused')),
      updatedAt: v.number(),
      chain: v.object({
        id: v.id('chains'),
        chainId: v.number(),
        name: v.string(),
        isMainnet: v.boolean(),
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
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const executables = await ctx.db
      .query('executables')
      .withIndex('by_organization', (q) =>
        q.eq('organization', args.organizationId),
      )
      .collect();

    // Sort by updatedAt DESC (most recently active)
    executables.sort((a, b) => b.updatedAt - a.updatedAt);

    const result = await Promise.all(
      executables.slice(0, limit).map(async (executable) => {
        const chain = await ctx.db.get(executable.chain);

        if (!chain) {
          return null;
        }

        const chainName =
          CHAIN_NAMES[chain.chainId as keyof typeof CHAIN_NAMES] ||
          `Chain ${chain.chainId}`;
        const isMainnet = MAINNET_CHAIN_IDS.includes(chain.chainId);

        return {
          id: executable._id,
          name: executable.name,
          status: executable.status,
          updatedAt: executable.updatedAt,
          chain: {
            id: chain._id,
            chainId: chain.chainId,
            name: chainName,
            isMainnet,
          },
          trigger: executable.trigger,
        };
      }),
    );

    return result.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );
  },
});
