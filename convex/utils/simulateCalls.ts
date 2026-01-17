import type { Address, Call } from 'viem';
import { createPublicClient, http } from 'viem';

interface SimulateCallsOptions {
  calls: Call[];
  options: {
    rpcUrl: string;
    account: Address;
  };
}

/**
 * Simulate calls on-chain to verify they would succeed
 */
export async function simulateCalls({
  calls,
  options,
}: SimulateCallsOptions): Promise<void> {
  const client = createPublicClient({
    transport: http(options.rpcUrl),
  });

  // Simulate each call
  for (const call of calls) {
    await client.call({
      account: options.account,
      to: call.to,
      data: call.data,
    });
  }
}
