import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { api } from '../_generated/api';
import { mutation } from '../_generated/server';

// Create new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(args, 'args');

    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User doesn't exist");
    }
    // Check if slug is already taken
    const existing = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (existing) {
      throw new Error('Organization slug already exists');
    }

    // Create organization
    const orgId = await ctx.db.insert('organizations', {
      name: args.name,
      slug: args.slug,
      description: args.description,
      settings: {
        allowInvites: true,
        requireApproval: false,
        defaultRole: 'member',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add creator as admin
    await ctx.db.insert('organizationMembers', {
      organizationId: orgId,
      userId: userId,
      role: 'admin',
      status: 'active',
      joinedAt: Date.now(),
    });

    // Update user settings to set this as current organization
    const userSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (userSettings) {
      await ctx.db.patch(userSettings._id, {
        currentOrganizationId: orgId,
        updatedAt: Date.now(),
      });
    } else {
      // Create user settings if they don't exist
      await ctx.db.insert('userSettings', {
        userId,
        currentOrganizationId: orgId,
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            organizationUpdates: true,
          },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return orgId;
  },
});

// Accept organization invite
export const acceptInvite = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Find the invite
    const invite = await ctx.db
      .query('organizationInvites')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!invite) {
      throw new Error('Invalid invite token');
    }

    if (invite.status !== 'pending') {
      throw new Error('Invite is no longer valid');
    }

    if (invite.expiresAt < Date.now()) {
      throw new Error('Invite has expired');
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', invite.organizationId),
      )
      .filter((q) => q.eq(q.field('userId'), userId))
      .first();

    if (existingMember) {
      throw new Error('User is already a member of this organization');
    }

    // Get user details from the authenticated user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get organization details
    const organization = await ctx.db.get(invite.organizationId);

    // Add user as member
    await ctx.db.insert('organizationMembers', {
      organizationId: invite.organizationId,
      userId: userId,
      email: invite.email,
      name: user.name,
      avatar: user.image,
      role: invite.role,
      status: 'active',
      joinedAt: Date.now(),
      invitedBy: invite.invitedBy,
      invitedAt: invite.createdAt,
    });

    // Update invite status
    await ctx.db.patch(invite._id, {
      status: 'accepted',
      acceptedAt: Date.now(),
    });

    // Send welcome email (scheduled action)
    await ctx.scheduler.runAfter(0, api.action.email.sendWelcomeEmailAction, {
      to: invite.email,
      organizationName: organization?.name || 'Unknown Organization',
      userName: user.name || 'User',
      role: invite.role,
    });

    return invite.organizationId;
  },
});

// Set current user's organization
export const setUserCurrentOrganization = mutation({
  args: { organizationId: v.id('organizations') },
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

    // Get or create user settings
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (settings) {
      // Update existing settings
      await ctx.db.patch(settings._id, {
        currentOrganizationId: args.organizationId,
        updatedAt: Date.now(),
      });
    } else {
      // Create new settings
      await ctx.db.insert('userSettings', {
        userId,
        currentOrganizationId: args.organizationId,
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            organizationUpdates: true,
          },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
