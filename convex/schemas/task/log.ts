import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  taskExecutableId: v.id('executables'),
  executionId: v.optional(v.id('taskExecutions')),
  log: v.any(),
  createdAt: v.number(),
})
  .index('by_executable', ['taskExecutableId'])
  .index('by_execution', ['executionId']);
