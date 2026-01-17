'use node';

import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { action, internalAction } from '../_generated/server';
import { decompressTask } from '../utils/decompress';

export const getTaskCode = action({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      throw new Error('Task not found');
    }

    const arrayBuffer = await blob.arrayBuffer();
    const { source } = decompressTask(arrayBuffer);

    return source;
  },
});

export const getTaskSchema = action({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args): Promise<string> => {
    try {
      // Find task by storageId (hash)
      // Type assertion needed until Convex regenerates types for getTaskByHash
      const task = await ctx.runQuery(internal.query.task.getTaskByHash, {
        hash: args.storageId,
      });

      if (!task) {
        return '{}';
      }

      if (!task.schema) {
        return '{}';
      }

      return task.schema;
    } catch (error) {
      console.error('Error in getTaskSchema:', error);
      return '{}';
    }
  },
});

export const getTaskCodeInternal = internalAction({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      throw new Error('Task not found');
    }

    const arrayBuffer = await blob.arrayBuffer();
    const { bundle } = decompressTask(arrayBuffer);

    return bundle;
  },
});
