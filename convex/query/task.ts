import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalQuery, query } from '../_generated/server';

export const getTasksByOrganization = query({
  args: {
    organizationId: v.id('organizations'),
  },
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

    const tasks = await ctx.db
      .query('tasks')
      .filter((q) => q.eq(q.field('organizationId'), args.organizationId))
      .collect();

    // Enrich tasks with creator information and executable count
    const tasksWithCreator = await Promise.all(
      tasks.map(async (task) => {
        const creator = task.creator ? await ctx.db.get(task.creator) : null;

        // Count executables linked to this task
        const executables = await ctx.db
          .query('executables')
          .filter((q) => q.eq(q.field('taskId'), task._id))
          .collect();

        return {
          _id: task._id,
          hash: task.hash,
          checkSum: task.checkSum,
          creator: creator
            ? {
                id: creator._id,
                name: creator.name ?? null,
                email: creator.email ?? null,
              }
            : null,
          _creationTime: task._creationTime,
          executableCount: executables.length,
        };
      }),
    );

    return tasksWithCreator;
  },
});

export const getTaskById = internalQuery({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      return null;
    }
    return {
      _id: task._id,
      hash: task.hash,
      checkSum: task.checkSum,
      organizationId: task.organizationId,
      creator: task.creator,
    };
  },
});
