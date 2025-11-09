import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { api } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';
import { internalMutation, mutation } from '../_generated/server';

// Create new organization
export const createOrganization = internalMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User doesn't exist");
    }

    // Validate and trim name
    const trimmedName = args.name?.trim();
    if (!trimmedName || trimmedName.length === 0) {
      throw new Error('Organization name is required and cannot be empty');
    }

    // Validate and trim slug
    const trimmedSlug = args.slug?.trim();
    if (!trimmedSlug || trimmedSlug.length === 0) {
      throw new Error('Organization slug is required and cannot be empty');
    }

    // Check if slug is already taken
    const existing = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', trimmedSlug))
      .first();

    if (existing) {
      throw new Error('Organization slug already exists');
    }

    // Create organization
    const orgId = await ctx.db.insert('organizations', {
      name: trimmedName,
      slug: trimmedSlug,
      description: args.description?.trim() || undefined,
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

    // Get user details from the authenticated user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get organization details
    const organization = await ctx.db.get(invite.organizationId);

    if (existingMember) {
      // User is already a member - just mark invite as accepted and return
      // This handles cases where user was added directly or accepted via another invite
      if (invite.status === 'pending') {
        await ctx.db.patch(invite._id, {
          status: 'accepted',
          acceptedAt: Date.now(),
        });
      }

      // If member is suspended, reactivate them
      if (existingMember.status === 'suspended') {
        await ctx.db.patch(existingMember._id, {
          status: 'active',
        });
      }

      return invite.organizationId;
    }

    // Add user as member
    await ctx.db.insert('organizationMembers', {
      organizationId: invite.organizationId,
      userId: userId,
      email: invite.email,
      name: user.name,
      role: invite.role,
      status: 'active',
      joinedAt: Date.now(),
      invitedBy: invite.invitedBy,
      invitedAt: invite.createdAt,
    });

    // Set this organization as the user's current organization
    const userSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (userSettings) {
      await ctx.db.patch(userSettings._id, {
        currentOrganizationId: invite.organizationId,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('userSettings', {
        userId,
        currentOrganizationId: invite.organizationId,
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

    // Verify organization exists
    const org = await ctx.db.get(args.organizationId);
    if (!org) {
      throw new Error('Organization not found');
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

// Helper function to check if user is admin
async function requireAdmin(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
  userId: Id<'users'>,
) {
  const membership = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .filter((q) =>
      q.and(
        q.eq(q.field('organizationId'), organizationId),
        q.eq(q.field('status'), 'active'),
        q.eq(q.field('role'), 'admin'),
      ),
    )
    .first();

  if (!membership) {
    throw new Error('Only admins can perform this action');
  }

  return membership;
}

// Invite user to organization (Admin only)
export const inviteMember = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('member'), v.literal('viewer')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Verify user is admin
    await requireAdmin(ctx, args.organizationId, userId);

    // Check if user is already a member
    const existingMember = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();

    if (existingMember && existingMember.status === 'active') {
      throw new Error('User is already a member of this organization');
    }

    // Check for existing pending invite
    const existingInvite = await ctx.db
      .query('organizationInvites')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('email'), args.email),
          q.eq(q.field('status'), 'pending'),
          q.gt(q.field('expiresAt'), Date.now()),
        ),
      )
      .first();

    if (existingInvite) {
      throw new Error('User already has a pending invitation');
    }

    // Generate cryptographically secure token
    // Use Web Crypto API for secure random generation
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const token = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Create invite
    const inviteId = await ctx.db.insert('organizationInvites', {
      organizationId: args.organizationId,
      email: args.email,
      role: args.role,
      invitedBy: userId,
      token,
      status: 'pending',
      expiresAt,
      createdAt: Date.now(),
    });

    // Get organization and inviter details for email
    const organization = await ctx.db.get(args.organizationId);
    const inviter = await ctx.db.get(userId);

    // Send invitation email (scheduled action)
    const inviteUrl = `${process.env.SITE_URL || 'http://localhost:5173'}/accept-invite?token=${token}`;
    await ctx.scheduler.runAfter(0, api.action.email.sendInvitationEmail, {
      to: args.email,
      organizationName: organization?.name || 'Unknown Organization',
      inviterName: inviter?.name || 'Someone',
      inviteUrl,
      role: args.role,
    });

    return inviteId;
  },
});

// Remove member from organization (Admin only)
export const removeMember = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    memberId: v.id('organizationMembers'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Verify user is admin
    await requireAdmin(ctx, args.organizationId, userId);

    // Get member to remove
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    if (member.organizationId !== args.organizationId) {
      throw new Error('Member does not belong to this organization');
    }

    // Check if trying to remove self
    if (member.userId === userId) {
      // Check if there are other admins
      const otherAdmins = await ctx.db
        .query('organizationMembers')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId),
        )
        .filter((q) =>
          q.and(
            q.eq(q.field('status'), 'active'),
            q.eq(q.field('role'), 'admin'),
            q.neq(q.field('userId'), userId),
          ),
        )
        .first();

      if (!otherAdmins) {
        throw new Error(
          'Cannot remove yourself. You are the only admin. Transfer ownership or add another admin first.',
        );
      }
    }

    // Remove member (set status to inactive or delete)
    await ctx.db.patch(args.memberId, {
      status: 'suspended',
    });

    return { success: true };
  },
});

// Change member role (Admin only)
export const changeMemberRole = mutation({
  args: {
    organizationId: v.id('organizations'),
    memberId: v.id('organizationMembers'),
    newRole: v.union(
      v.literal('admin'),
      v.literal('member'),
      v.literal('viewer'),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Verify user is admin
    await requireAdmin(ctx, args.organizationId, userId);

    // Get member
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    if (member.organizationId !== args.organizationId) {
      throw new Error('Member does not belong to this organization');
    }

    // Prevent changing own role if last admin
    if (member.userId === userId && member.role === 'admin') {
      const otherAdmins = await ctx.db
        .query('organizationMembers')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId),
        )
        .filter((q) =>
          q.and(
            q.eq(q.field('status'), 'active'),
            q.eq(q.field('role'), 'admin'),
            q.neq(q.field('userId'), userId),
          ),
        )
        .first();

      if (!otherAdmins && args.newRole !== 'admin') {
        throw new Error(
          'Cannot change your own role. You are the only admin. Add another admin first.',
        );
      }
    }

    // Update role
    await ctx.db.patch(args.memberId, {
      role: args.newRole,
    });

    return { success: true };
  },
});

// Update organization settings (Admin only)
export const updateOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    settings: v.optional(
      v.object({
        allowInvites: v.boolean(),
        requireApproval: v.boolean(),
        defaultRole: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Verify user is admin
    await requireAdmin(ctx, args.organizationId, userId);

    // Get current organization
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Validate and trim name if provided
    if (args.name !== undefined) {
      const trimmedName = args.name.trim();
      if (!trimmedName || trimmedName.length === 0) {
        throw new Error('Organization name cannot be empty');
      }
    }

    // Check slug uniqueness if name changed (slug is derived from name)
    if (args.name && args.name.trim() !== organization.name) {
      // For now, we'll keep the slug as is. In future, we might want to update slug too
      // but that requires URL changes, so we'll leave it for now
    }

    // Update organization
    const updates: {
      name?: string;
      description?: string | undefined;
      logo?: string | undefined;
      settings?: {
        allowInvites: boolean;
        requireApproval: boolean;
        defaultRole: string;
      };
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim() || undefined;
    }
    if (args.logo !== undefined) {
      updates.logo = args.logo;
    }
    if (args.settings !== undefined) {
      updates.settings = args.settings;
    }

    await ctx.db.patch(args.organizationId, updates);

    return { success: true };
  },
});

// Delete organization (Admin only)
export const deleteOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Verify user is admin
    await requireAdmin(ctx, args.organizationId, userId);

    // Check if there are other admins (safety check)
    const allAdmins = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'active'),
          q.eq(q.field('role'), 'admin'),
        ),
      )
      .collect();

    if (allAdmins.length > 1) {
      throw new Error(
        'Multiple admins exist. All admins must agree to delete the organization.',
      );
    }

    // Update currentOrganizationId for all users who had this org set
    const allMembers = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect();

    for (const member of allMembers) {
      const userSettings = await ctx.db
        .query('userSettings')
        .withIndex('by_user', (q) =>
          q.eq('userId', member.userId as Id<'users'>),
        )
        .first();

      if (userSettings?.currentOrganizationId === args.organizationId) {
        // Find first available organization for this user
        const userMemberships = await ctx.db
          .query('organizationMembers')
          .withIndex('by_user', (q) =>
            q.eq('userId', member.userId as Id<'users'>),
          )
          .filter((q) =>
            q.and(
              q.neq(q.field('organizationId'), args.organizationId),
              q.eq(q.field('status'), 'active'),
            ),
          )
          .collect();

        // Find the first valid organization
        let firstValidOrgId: Id<'organizations'> | undefined;
        for (const membership of userMemberships) {
          const org = await ctx.db.get(membership.organizationId);
          if (org?.name && org.name.trim().length > 0) {
            firstValidOrgId = membership.organizationId;
            break;
          }
        }

        await ctx.db.patch(userSettings._id, {
          currentOrganizationId: firstValidOrgId,
          updatedAt: Date.now(),
        });
      }
    }

    // Delete all pending invitations for this organization
    const allInvites = await ctx.db
      .query('organizationInvites')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect();

    for (const invite of allInvites) {
      await ctx.db.delete(invite._id);
    }

    // Delete all organization members
    for (const member of allMembers) {
      await ctx.db.delete(member._id);
    }

    // TODO: In production, you might want to:
    // 1. Soft delete (mark as deleted)
    // 2. Archive all data
    // 3. Send confirmation email
    // 4. Add a grace period before permanent deletion

    // For now, we'll just delete (be careful!)
    // In production, consider soft delete
    await ctx.db.delete(args.organizationId);

    return { success: true };
  },
});

// Leave organization (Member/Viewer only, not Admin)
export const leaveOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get membership
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
      throw new Error('You are not a member of this organization');
    }

    // Prevent admins from leaving if they're the only admin
    if (membership.role === 'admin') {
      const otherAdmins = await ctx.db
        .query('organizationMembers')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId),
        )
        .filter((q) =>
          q.and(
            q.eq(q.field('status'), 'active'),
            q.eq(q.field('role'), 'admin'),
            q.neq(q.field('userId'), userId),
          ),
        )
        .first();

      if (!otherAdmins) {
        throw new Error(
          'Cannot leave organization. You are the only admin. Transfer ownership or delete the organization instead.',
        );
      }
    }

    // Remove membership
    await ctx.db.patch(membership._id, {
      status: 'suspended',
    });

    // If this was the current organization, clear it from user settings
    const userSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (userSettings?.currentOrganizationId === args.organizationId) {
      await ctx.db.patch(userSettings._id, {
        currentOrganizationId: undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Cancel/revoke invite (Admin only)
export const cancelInvite = internalMutation({
  args: {
    inviteId: v.id('organizationInvites'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get invite
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error('Invite not found');
    }

    // Verify user is admin of the organization
    await requireAdmin(ctx, invite.organizationId, userId);

    // Only track removal if invite was pending (not already accepted/cancelled)
    const shouldTrackRemoval = invite.status === 'pending';

    // Cancel invite
    await ctx.db.patch(args.inviteId, {
      status: 'cancelled',
    });

    return {
      success: true,
      shouldRemoveMember: shouldTrackRemoval,
      organizationId: invite.organizationId,
    };
  },
});

// Decline invite (User action - for the invited user)
export const declineInvite = internalMutation({
  args: {
    inviteId: v.id('organizationInvites'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get invite
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error('Invite not found');
    }

    // Get user to verify email matches
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify the invite is for this user's email
    if (invite.email !== user.email) {
      throw new Error('This invitation is not for you');
    }

    // Verify invite is still pending
    if (invite.status !== 'pending') {
      throw new Error('Invite is no longer valid');
    }

    // Mark invite as declined
    await ctx.db.patch(args.inviteId, {
      status: 'cancelled', // Using cancelled status for declined invites
    });

    return { success: true, organizationId: invite.organizationId };
  },
});

// Delete invite completely (Admin only)
export const deleteInvite = internalMutation({
  args: {
    inviteId: v.id('organizationInvites'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get invite
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error('Invite not found');
    }

    // Verify user is admin of the organization
    await requireAdmin(ctx, invite.organizationId, userId);

    // Delete the invite completely
    await ctx.db.delete(args.inviteId);

    return { success: true, organizationId: invite.organizationId };
  },
});
