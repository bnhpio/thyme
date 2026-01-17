import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  organizationId: v.id('organizations'),
  chainId: v.number(),
  rpcUrl: v.string(),
  createdBy: v.id('users'),
  createdAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_organization_and_chain', ['organizationId', 'chainId']);
