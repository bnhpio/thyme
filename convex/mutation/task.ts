import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalMutation, mutation } from '../_generated/server';

export const createTask = internalMutation({
  args: {
    storageId: v.id('_storage'),
    organizationId: v.optional(v.id('organizations')),
    checkSum: v.string(),
    userId: v.id('users'),
    schema: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert('tasks', {
      hash: args.storageId,
      organizationId: args.organizationId,
      checkSum: args.checkSum,
      creator: args.userId,
      schema: args.schema,
    });
    return taskId;
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get the task
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user is a member of the organization
    if (task.organizationId) {
      const membership = await ctx.db
        .query('organizationMembers')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .filter((q) =>
          q.and(
            q.eq(q.field('organizationId'), task.organizationId),
            q.eq(q.field('status'), 'active'),
          ),
        )
        .first();

      if (!membership) {
        throw new Error('User is not a member of this organization');
      }
    }

    // Check if any executables are linked to this task
    const executables = await ctx.db
      .query('executables')
      .filter((q) => q.eq(q.field('taskId'), args.taskId))
      .collect();

    if (executables.length > 0) {
      throw new Error(
        `Cannot delete task: ${executables.length} executable(s) are linked to this task`,
      );
    }

    // Delete the storage file
    await ctx.storage.delete(task.hash);

    // Delete the task
    await ctx.db.delete(args.taskId);
  },
});
