import { Autumn } from '@useautumn/convex';
import { api, components } from './_generated/api';
import type { Id } from './_generated/dataModel';
import type { ActionCtx, QueryCtx } from './_generated/server';

export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? '',
  identify: async (ctx: QueryCtx | ActionCtx) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      return null;
    }

    const settings = await ctx.runQuery(api.query.user.getUserSettings, {
      userId: user.subject.split('|')[0] as Id<'users'>,
    });

    const organizationId = settings?.currentOrganizationId;

    if (!organizationId) {
      return null;
    }

    const organization = await ctx.runQuery(
      api.query.organization.getOrganizationById,
      {
        organizationId: organizationId,
      },
    );
    return {
      customerId: organizationId,
      customerData: {
        name: organization?.name,
      },
    };
  },
});

/**
 * These exports are required for our react hooks and components
 */

export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = autumn.api();
