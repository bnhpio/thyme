import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  key: v.string(),
  value: v.string(),
  updatedAt: v.number(),
  updatedBy: v.optional(v.id('users')),
}).index('by_key', ['key']);
