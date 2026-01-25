import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  organizationId: v.id('organizations'),
  chainId: v.number(),
  rpcUrls: v.array(v.string()),
  isEnabled: v.boolean(),
  priority: v.optional(v.number()),
})
  .index('by_organization', ['organizationId'])
  .index('by_org_chain', ['organizationId', 'chainId']);
