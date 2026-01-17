import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalQuery, query } from '../_generated/server';

export const getOrganizationChainRpcs = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Verify user is a member of the organization
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

    // Get all RPC configurations for this organization
    const rpcs = await ctx.db
      .query('organizationChainRpcs')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect();

    return rpcs;
  },
});

export const getChainRpcUrl = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    chainId: v.number(),
  },
  handler: async (ctx, args) => {
    // First, check if organization has a custom RPC for this chain
    const customRpc = await ctx.db
      .query('organizationChainRpcs')
      .withIndex('by_organization_and_chain', (q) =>
        q.eq('organizationId', args.organizationId).eq('chainId', args.chainId),
      )
      .first();

    if (customRpc) {
      return customRpc.rpcUrl;
    }

    // Fallback to predefined chain RPC
    const chain = await ctx.db
      .query('chains')
      .withIndex('by_chain_id', (q) => q.eq('chainId', args.chainId))
      .first();

    if (!chain || chain.rpcUrls.length === 0) {
      throw new Error(`No RPC URL found for chain ${args.chainId}`);
    }

    // Return first RPC URL from predefined chain
    return chain.rpcUrls[0];
  },
});
