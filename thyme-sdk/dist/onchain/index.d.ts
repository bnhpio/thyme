import { type Call, type SimulateCallsReturnType } from 'viem';
import type { SimulateCallsOptions } from './types';
/**
 * Simulates a set of calls against a given RPC URL and account(optional)
 * @param args - The options for the simulation
 * @param args.calls - The calls to simulate
 * @param args.options - The options for the simulation
 * @param args.options.rpcUrl - The RPC URL to use
 * @param args.options.account - The account to use (optional)
 * @returns The simulated transaction return type
 */
export declare function simulateCalls(args: SimulateCallsOptions): Promise<SimulateCallsReturnType<Call[]>>;
