'use node';

import { v } from 'convex/values';
import { internalAction } from '../../_generated/server';
import { generateToken, hashToken } from './utils';

export const _generateRandomToken = internalAction({
  returns: v.string(),
  handler: async () => {
    return generateToken();
  },
});

export const _hashToken = internalAction({
  args: {
    token: v.string(),
  },
  returns: v.string(),
  handler: async (_, args) => {
    return hashToken(args.token);
  },
});
