import { v } from 'convex/values';
import { internalQuery } from '../_generated/server';

export const getProfileByOrganizationAndAlias = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    alias: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .withIndex('by_organization_and_alias', (q) =>
        q.eq('organizationId', args.organizationId).eq('alias', args.alias),
      )
      .first();
  },
});
