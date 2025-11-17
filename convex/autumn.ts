import { getAuthUserId } from '@convex-dev/auth/server';
import { Autumn } from '@useautumn/convex';
import { api, components } from './_generated/api';
import type { Id } from './_generated/dataModel';
import type { ActionCtx, QueryCtx } from './_generated/server';

export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? '',
  identify: async (ctx: {
    ctx: QueryCtx | ActionCtx;
    custom: {
      customerId: Id<'organizations'>;
      customerData: {
        name: string;
      };
    };
  }) => {
    if (ctx.custom) {
      return ctx.custom;
    }

    const checkedCtx = ctx.ctx
      ? (ctx.ctx as QueryCtx | ActionCtx)
      : (ctx as unknown as QueryCtx | ActionCtx);
    const userId = await getAuthUserId(checkedCtx);

    if (!userId) {
      return null;
    }

    const settings = await checkedCtx.runQuery(api.query.user.getUserSettings, {
      userId: userId,
    });

    const organizationId = settings?.currentOrganizationId;

    if (!organizationId) {
      return null;
    }

    const organization = await checkedCtx.runQuery(
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
