import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  name: v.string(),
  slug: v.string(), // URL-friendly identifier
  description: v.optional(v.string()),
  logo: v.optional(v.string()), // URL or storage ID
  settings: v.object({
    allowInvites: v.boolean(),
    requireApproval: v.boolean(),
    defaultRole: v.string(), // "admin", "member", "viewer"
  }),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_slug', ['slug'])
  .index('by_created_at', ['createdAt']);
