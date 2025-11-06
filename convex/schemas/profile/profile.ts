import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  organizationId: v.id('organizations'),
  salt: v.string(),
  alias: v.string(),
  address: v.string(),
  createdBy: v.id('users'),
  chain: v.id('chains'),
}).index('by_organization_and_alias', ['organizationId', 'alias']);
