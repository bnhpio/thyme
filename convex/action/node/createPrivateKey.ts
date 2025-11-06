'use node';
import { v } from 'convex/values';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';
import { internalAction } from '../../_generated/server';
import { decryptPrivateKey, encryptPrivateKey } from './utils';

export default internalAction({
  returns: {
    encryptedPrivateKey: v.string(),
    address: v.string(),
  },

  handler: async () => {
    let privateKey: `0x${string}` | null = generatePrivateKey();
    const address = privateKeyToAddress(privateKey);
    const masterKey = process.env.MASTER_KEY;

    if (!masterKey) {
      throw new Error('MASTER_KEY environment variable is required');
    }

    // Encrypt the private key with the master key
    const encryptedPrivateKey = await encryptPrivateKey(privateKey, masterKey);

    const decryptedPrivateKey = await decryptPrivateKey(
      encryptedPrivateKey,
      masterKey,
    );
    if (decryptedPrivateKey !== privateKey) {
      privateKey = null;
      throw new Error(
        'Decrypted private key does not match the original private key',
      );
    }
    privateKey = null;

    return { encryptedPrivateKey, address: address };
  },
});
