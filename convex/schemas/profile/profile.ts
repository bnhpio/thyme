import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  organizationId: v.id('organizations'),
  encryptedPrivateKey: v.string(),
  alias: v.string(),
  address: v.string(),
  createdBy: v.id('users'),
}).index('by_organization_and_alias', ['organizationId', 'alias']);
