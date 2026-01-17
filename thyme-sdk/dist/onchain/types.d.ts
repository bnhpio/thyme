import type { Address, Call } from 'viem';
export interface SimulateCallsOptions {
    calls: Call[];
    options: {
        account?: Address;
        rpcUrl: string;
    };
}
