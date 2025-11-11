import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  taskId: v.id('tasks'),
  name: v.string(),
  createdAt: v.number(),
  organization: v.id('organizations'),
  createdBy: v.id('users'),
  updatedAt: v.number(),
  status: v.union(
    v.literal('active'),
    v.literal('paused'),
    v.literal('finished'),
    v.literal('failed'),
  ),
  chain: v.id('chains'),
  args: v.string(),
  profile: v.id('profiles'),
  trigger: v.union(
    v.object({
      type: v.literal('cron'),
      schedule: v.string(),
      withRetry: v.boolean(),
      until: v.optional(v.number()),
    }),
    v.object({
      type: v.literal('single'),
      timestamp: v.number(),
      withRetry: v.boolean(),
    }),
  ),
  schedulerJobId: v.optional(v.string()),
  cronJobId: v.optional(v.string()),
}).index('by_organization', ['organization']);
