import { v } from 'convex/values';
import { internalQuery, query } from '../_generated/server';

export const getChainById = internalQuery({
  args: {
    chainId: v.id('chains'),
  },
  returns: {
    chainId: v.number(),
    rpcUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const chain = await ctx.db.get(args.chainId);
    if (!chain) {
      throw new Error('Chain not found');
    }
    return {
      chainId: chain.chainId,
      rpcUrls: chain.rpcUrls,
    };
  },
});

export const getAllChains = query({
  handler: async (ctx) => {
    const chains = await ctx.db.query('chains').collect();
    return chains.map((chain) => ({
      _id: chain._id,
      chainId: chain.chainId,
    }));
  },
});
