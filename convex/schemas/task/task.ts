import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  hash: v.id('_storage'),
  organizationId: v.optional(v.id('organizations')),
  creator: v.optional(v.id('users')),
  checkSum: v.string(),
});
