import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import { internalQuery, type QueryCtx, query } from '../_generated/server';

export const getOrganizationById = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

export const getOrganizationMembership = query({
  args: {
    organizationId: v.id('organizations'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const membership = await _getOrganizationMembership(
      ctx,
      args.userId,
      args.organizationId,
    );

    return membership;
  },
});

async function _getOrganizationMembership(
  ctx: QueryCtx,
  userId: Id<'users'>,
  organizationId: Id<'organizations'>,
) {
  const membership = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .filter((q) =>
      q.and(
        q.eq(q.field('organizationId'), organizationId),
        q.eq(q.field('status'), 'active'),
      ),
    )
    .first();
  return membership;
}

export const hasWriteAccessToOrganization = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const isOrganizationMember = await _getOrganizationMembership(
      ctx,
      args.userId,
      args.organizationId,
    );
    return (
      isOrganizationMember?.role === 'admin' ||
      isOrganizationMember?.role === 'member'
    );
  },
  returns: v.boolean(),
});

// Get all members of an organization
export const getOrganizationMembers = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    // Enrich with user details
    const membersWithDetails: Array<{
      _id: any;
      organizationId: any;
      userId: string;
      email?: string;
      name?: string;
      role: string;
      status: string;
      joinedAt: number;
      invitedBy?: string;
      invitedAt?: number;
      user: {
        id: Id<'users'>;
        name: string | undefined;
        email: string | undefined;
      } | null;
      invitedByUser: {
        id: Id<'users'>;
        name: string | undefined;
        email: string | undefined;
      } | null;
    }> = [];
    for (const member of members) {
      const user = await ctx.db.get(member.userId as Id<'users'>);
      const invitedByUser = member.invitedBy
        ? await ctx.db.get(member.invitedBy as Id<'users'>)
        : null;

      membersWithDetails.push({
        ...member,
        user: user
          ? {
              id: user._id,
              name: user.name,
              email: user.email,
            }
          : null,
        invitedByUser: invitedByUser
          ? {
              id: invitedByUser._id,
              name: invitedByUser.name,
              email: invitedByUser.email,
            }
          : null,
      });
    }

    return membersWithDetails;
  },
});

// Get active member count for an organization
export const getActiveMemberCount = query({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .filter((q) => q.eq(q.field('status'), 'active'))
      .collect();

    return members.length;
  },
});

// Get all invites for an organization (pending, cancelled, expired)
export const getOrganizationInvites = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const invites = await ctx.db
      .query('organizationInvites')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'pending'),
          q.eq(q.field('status'), 'cancelled'),
          q.eq(q.field('status'), 'expired'),
        ),
      )
      .collect();

    // Enrich with inviter details
    const invitesWithDetails = [];
    for (const invite of invites) {
      const inviter = await ctx.db.get(invite.invitedBy);

      invitesWithDetails.push({
        ...invite,
        inviter: inviter
          ? {
              id: inviter._id,
              name: inviter.name,
              email: inviter.email,
            }
          : null,
        isExpired: invite.expiresAt < Date.now(),
      });
    }

    return invitesWithDetails;
  },
});

export const getOrganizationAutumnDataByOrganizationId = internalQuery({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }
    return {
      customerId: organization._id,
      customerData: { name: organization.name },
    };
  },
});
