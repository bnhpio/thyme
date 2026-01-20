import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { mutation } from '../_generated/server';

/**
 * Update the current user's name
 */
export const updateUserName = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate name
    const trimmedName = args.name.trim();
    if (!trimmedName || trimmedName.length === 0) {
      throw new Error('Name cannot be empty');
    }

    // Get current user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user name
    await ctx.db.patch(userId, {
      name: trimmedName,
    });

    return { success: true };
  },
});

export const updateUserTheme = mutation({
  args: {
    theme: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Find existing user settings
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    if (!existingSettings) {
      throw Error("Settings doesn't exist");
    }
    const now = Date.now();
    // Update existing settings - merge preferences to preserve other fields
    await ctx.db.patch(existingSettings._id, {
      preferences: {
        ...existingSettings.preferences,
        theme: args.theme,
      },
      updatedAt: now,
    });

    return { success: true };
  },
});
