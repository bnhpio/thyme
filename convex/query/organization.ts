import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import { query } from '../_generated/server';

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
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('organizationId'), args.organizationId),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    return membership;
  },
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

// Get all pending invites for an organization
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
      .filter((q) => q.eq(q.field('status'), 'pending'))
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
