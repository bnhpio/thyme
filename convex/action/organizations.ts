import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { action, internalAction } from '../_generated/server';
import { autumn } from '../autumn';

export const checkMemberLimit = internalAction({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.object({
    allowed: v.boolean(),
    reason: v.union(v.string(), v.null()),
  }),
  handler: async (
    ctx,
    _args,
  ): Promise<{
    allowed: boolean;
    reason: string | null;
  }> => {
    const result = await autumn.check(
      { ctx },
      {
        featureId: 'members',
      },
    );

    if (result.error || !result.data?.allowed) {
      throw new Error('Member limit exceeded');
    }

    return {
      allowed: result.data.allowed,
      reason: null,
    };
  },
});
export const trackMemberRemoved = internalAction({
  args: {
    organizationId: v.id('organizations'),
    custom: v.optional(
      v.object({
        customerId: v.id('organizations'),
        customerData: v.optional(
          v.object({
            name: v.string(),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, _args) => {
    const result = await autumn.track(
      { ctx, custom: _args.custom },
      {
        featureId: 'members',
        value: -1,
      },
    );

    if (result.error) {
      throw new Error(
        `Failed to track member removal: ${result.error.message || 'Unknown error'}`,
      );
    }

    return result.data;
  },
});

export const trackMemberAdded = internalAction({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx) => {
    const result = await autumn.track(
      { ctx },
      {
        featureId: 'members',
        value: 1,
      },
    );

    if (result.error) {
      throw new Error(
        `Failed to track member addition: ${result.error.message || 'Unknown error'}`,
      );
    }

    return result.data;
  },
});

export const inviteMember = action({
  args: {
    organizationId: v.id('organizations'),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('member'), v.literal('viewer')),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.action.organizations.checkMemberLimit, {
      organizationId: args.organizationId,
    });
    await ctx.runMutation(internal.mutation.organizations.inviteMember, {
      organizationId: args.organizationId,
      email: args.email,
      role: args.role,
    });

    await ctx.runAction(internal.action.organizations.trackMemberAdded, {
      organizationId: args.organizationId,
    });

    return;
  },
});

export const removeMember = action({
  args: {
    organizationId: v.id('organizations'),
    memberId: v.id('organizationMembers'),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.mutation.organizations.removeMember, {
      organizationId: args.organizationId,
      memberId: args.memberId,
    });

    await ctx.runAction(internal.action.organizations.trackMemberRemoved, {
      organizationId: args.organizationId,
    });
  },
});

export const cancelInvite = action({
  args: {
    inviteId: v.id('organizationInvites'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.runMutation(
      internal.mutation.organizations.cancelInvite,
      {
        inviteId: args.inviteId,
      },
    );
    await ctx.runMutation(internal.mutation.organizations.deleteInvite, {
      inviteId: args.inviteId,
    });
    if (result.shouldRemoveMember) {
      await ctx.runAction(internal.action.organizations.trackMemberRemoved, {
        organizationId: result.organizationId,
      });
    }
  },
});

export const declineInvite = action({
  args: {
    inviteId: v.id('organizationInvites'),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.mutation.organizations.declineInvite, {
      inviteId: args.inviteId,
    });
  },
});

export const deleteInvite = action({
  args: {
    inviteId: v.id('organizationInvites'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.runMutation(
      internal.mutation.organizations.deleteInvite,
      {
        inviteId: args.inviteId,
      },
    );
    await ctx.runAction(internal.action.organizations.trackMemberRemoved, {
      organizationId: result.organizationId,
    });
  },
});

export const createOrganization = action({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.runMutation(
      internal.mutation.organizations.createOrganization,
      {
        name: args.name,
        slug: args.slug,
        description: args.description,
      },
    );
    await ctx.runAction(internal.action.organizations.trackMemberAdded, {
      organizationId: result,
    });
  },
});
