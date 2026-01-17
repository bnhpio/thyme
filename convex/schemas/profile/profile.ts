import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  organizationId: v.id('organizations'),
  salt: v.string(),
  alias: v.string(),
  address: v.string(),
  createdBy: v.id('users'),
  chain: v.id('chains'),
  // Optional custom RPC URL for sandbox execution and simulation
  // If not set, uses the default chain RPC
  customRpcUrl: v.optional(v.string()),
}).index('by_organization_and_alias', ['organizationId', 'alias']);
