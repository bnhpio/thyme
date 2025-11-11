import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  taskExecutableId: v.id('executables'),
  log: v.any(),
  createdAt: v.number(),
  type: v.union(v.literal('info'), v.literal('warn'), v.literal('error')),
}).index('by_executable', ['taskExecutableId']);
