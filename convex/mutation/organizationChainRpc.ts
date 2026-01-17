import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { mutation } from '../_generated/server';

export const addOrganizationChainRpc = mutation({
  args: {
    organizationId: v.id('organizations'),
    chainId: v.number(),
    rpcUrl: v.string(),
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

    // Check if RPC URL already exists for this chain
    const existing = await ctx.db
      .query('organizationChainRpcs')
      .withIndex('by_organization_and_chain', (q) =>
        q.eq('organizationId', args.organizationId).eq('chainId', args.chainId),
      )
      .first();

    if (existing) {
      throw new Error(
        'RPC URL already exists for this chain. Use update instead.',
      );
    }

    // Validate RPC URL format
    try {
      new URL(args.rpcUrl);
    } catch {
      throw new Error('Invalid RPC URL format');
    }

    // Create the RPC configuration
    await ctx.db.insert('organizationChainRpcs', {
      organizationId: args.organizationId,
      chainId: args.chainId,
      rpcUrl: args.rpcUrl,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const updateOrganizationChainRpc = mutation({
  args: {
    rpcId: v.id('organizationChainRpcs'),
    rpcUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get the RPC configuration
    const rpc = await ctx.db.get(args.rpcId);
    if (!rpc) {
      throw new Error('RPC configuration not found');
    }

    // Verify user is a member of the organization
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('organizationId'), rpc.organizationId),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    if (!membership) {
      throw new Error('User is not a member of this organization');
    }

    // Validate RPC URL format
    try {
      new URL(args.rpcUrl);
    } catch {
      throw new Error('Invalid RPC URL format');
    }

    // Update the RPC URL
    await ctx.db.patch(args.rpcId, {
      rpcUrl: args.rpcUrl,
    });
  },
});

export const deleteOrganizationChainRpc = mutation({
  args: {
    rpcId: v.id('organizationChainRpcs'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get the RPC configuration
    const rpc = await ctx.db.get(args.rpcId);
    if (!rpc) {
      throw new Error('RPC configuration not found');
    }

    // Verify user is a member of the organization
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('organizationId'), rpc.organizationId),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    if (!membership) {
      throw new Error('User is not a member of this organization');
    }

    // Delete the RPC configuration
    await ctx.db.delete(args.rpcId);
  },
});
