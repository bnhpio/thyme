'use node';

import { LocalAccountSigner } from '@aa-sdk/core';
import { alchemy, defineAlchemyChain } from '@account-kit/infra';
import {
  createSmartWalletClient,
  type SmartWalletClient,
} from '@account-kit/wallet-client';
import { v } from 'convex/values';
import { type Address, type Hex, keccak256, toHex } from 'viem';
import { internalAction } from '../../_generated/server';
import { getChain } from './utils';

export default internalAction({
  args: {
    salt: v.string(),
    chain: v.number(),
  },
  returns: {
    address: v.string(),
  },
  handler: async (_, args) => {
    const PRIVATE_KEY = process.env.PRIVATE_KEY as Hex;
    if (!PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is not set');
    }
    const { account } = await createAlchemyClient(
      PRIVATE_KEY,
      {
        apiKey: process.env.ALCHEMY_API_KEY as string,
        salt: keccak256(toHex(args.salt)),
        policyId: process.env.ALCHEMY_POLICY_ID as string,
        baseUrl: process.env.ALCHEMY_BASE_URL as string,
      },
      args.chain,
    );

    return {
      address: account,
    };
  },
});

export interface AlchemyOptions {
  apiKey: string;
  salt: Hex;
  policyId: string;
  baseUrl: string;
}

export const createAlchemyClient = async (
  privateKey: Hex,
  options: AlchemyOptions,
  chainId: number,
): Promise<{ client: SmartWalletClient; account: Address }> => {
  const signer = LocalAccountSigner.privateKeyToAccountSigner(privateKey);
  const transport = alchemy({
    apiKey: options.apiKey,
  });
  const realChain = getChain(chainId);
  if (!realChain) {
    throw new Error('Chain not found');
  }
  const alchemyChain = defineAlchemyChain({
    chain: realChain,
    rpcBaseUrl: options.baseUrl,
  });
  const client = createSmartWalletClient({
    transport,
    chain: alchemyChain,
    signer,
  });

  const account = await client.requestAccount({
    id: options.salt,
    creationHint: {
      createAdditional: true,
      salt: options.salt,
    },
  });
  return { client, account: account.address };
};
