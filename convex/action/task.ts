'use node';

import { decompressFiles } from '@bnhpio/thyme-sdk/archive';
import { v } from 'convex/values';
import { action, internalAction } from '../_generated/server';

export const getTaskCode = action({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      throw new Error('Task code not found');
    }

    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const result = await decompressFiles(uint8Array);

    // Find the code file (typically named 'code' or 'index' or has path containing 'code')
    const codeFile = result.files.find((file) => file.id === 'source.ts');

    return codeFile?.content || '';
  },
});

export const getTaskSchema = action({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      throw new Error('Task schema not found');
    }

    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const result = await decompressFiles(uint8Array);

    // Find the schema file (typically named 'schema.json' or has path containing 'schema')
    const schemaFile = result.files.find((file) => file.id === 'schema.json');

    return schemaFile?.content || '';
  },
});

export const getTaskCodeInternal = internalAction({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      throw new Error('Task code not found');
    }

    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const result = await decompressFiles(uint8Array);

    // Find the code file (typically named 'code' or 'index' or has path containing 'code')
    const codeFile = result.files.find((file) => file.id === 'index');

    return codeFile?.content || '';
  },
});
