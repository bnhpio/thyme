import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  executableId: v.id('executables'),
  timestamp: v.number(),
  status: v.union(
    v.literal('pending'),
    v.literal('simulation_pending'),
    v.literal('simulation_failed'),
    v.literal('sending'),
    v.literal('validating'),
    v.literal('success'),
    v.literal('sending_failed'),
    v.literal('failed'),
    v.literal('skipped'),
  ),
  startedAt: v.number(),
  updatedAt: v.number(),
  finishedAt: v.optional(v.number()),
  transactionHashes: v.array(v.string()),
  errorReason: v.optional(v.string()),
  cost: v.object({
    gas: v.string(),
    gasPrice: v.string(),
    price: v.string(),
    userPrice: v.string(),
  }),
})
  .index('by_executable', ['executableId'])
  .index('by_executable_updated_at', ['executableId', 'updatedAt']);
