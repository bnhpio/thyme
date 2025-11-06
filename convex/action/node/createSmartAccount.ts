'use node';

import { createAlchemyClient } from '@bnhpio/thyme-sdk/account/alchemy';
import { v } from 'convex/values';
import { type Hex, keccak256, toHex } from 'viem';
import { internal } from '../../_generated/api';
import { internalAction } from '../../_generated/server';

export default internalAction({
  args: {
    salt: v.string(),
    chain: v.id('chains'),
  },
  returns: {
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const privateKey = process.env.PRIVATE_KEY as Hex;
    const chain = await ctx.runQuery(internal.query.chain.getChainById, {
      chainId: args.chain,
    });
    console.log(toHex(args.salt), 'salt');
    const { account } = await createAlchemyClient(
      privateKey,
      {
        apiKey: process.env.ALCHEMY_API_KEY,
        salt: keccak256(toHex(args.salt)),
        policyId: process.env.ALCHEMY_POLICY_ID,
      },
      chain.chainId,
    );
    return {
      address: account,
    };
  },
});
