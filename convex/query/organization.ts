import { v } from 'convex/values';
import { query } from '../_generated/server';

export const getOrganizationById = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});
