import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  userId: v.id('users'),
  tokenHash: v.string(),
  expiresAt: v.number(),
  organzations: v.array(v.id('organizations')),
  name: v.string(),
})
  .index('by_user', ['userId'])
  .index('by_token_hash', ['tokenHash']);
