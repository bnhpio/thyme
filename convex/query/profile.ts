import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalQuery, query } from '../_generated/server';

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

export const getProfilesByOrganization = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Verify user is a member of this organization
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('organizationId'), args.organizationId),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    if (!membership) {
      throw new Error('User is not a member of this organization');
    }

    const profiles = await ctx.db
      .query('profiles')
      .filter((q) => q.eq(q.field('organizationId'), args.organizationId))
      .collect();

    // Enrich profiles with chain information
    const profilesWithChains = await Promise.all(
      profiles.map(async (profile) => {
        const chain = await ctx.db.get(profile.chain);
        return {
          ...profile,
          chainId: chain?.chainId,
          customRpcUrl: profile.customRpcUrl,
        };
      }),
    );

    return profilesWithChains;
  },
});

export const getProfileById = internalQuery({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      return null;
    }
    return {
      _id: profile._id,
      organizationId: profile.organizationId,
      alias: profile.alias,
      address: profile.address,
      chain: profile.chain,
      salt: profile.salt,
      createdBy: profile.createdBy,
      customRpcUrl: profile.customRpcUrl,
    };
  },
});
