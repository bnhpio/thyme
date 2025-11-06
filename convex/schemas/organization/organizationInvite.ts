import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  organizationId: v.id('organizations'),
  email: v.string(),
  role: v.string(), // "admin", "member", "viewer"
  invitedBy: v.id('users'), // Convex user ID
  token: v.string(), // Unique invite token
  status: v.string(), // "pending", "accepted", "expired", "cancelled"
  expiresAt: v.number(),
  createdAt: v.number(),
  acceptedAt: v.optional(v.number()),
})
  .index('by_organization', ['organizationId'])
  .index('by_email', ['email'])
  .index('by_token', ['token'])
  .index('by_status', ['status']);
