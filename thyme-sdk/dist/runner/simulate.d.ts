import type { Call, SimulateCallsReturnType } from 'viem';
import { type SimulateTaskArgs } from './types';
/**
 * Run a simulation task
 * @param args - The arguments for the simulation
 * @param args.runner - The runner to use
 * @param args.options - The options for the simulation
 * @param args.options.account - The account to use (optional)
 * @param args.options.rpcUrl - The RPC URL to use
 * @param args.context - The context for the simulation
 * @param args.context.userArgs - The user arguments for the simulation
 * @param args.context.secrets - The secrets for the simulation
 * @returns The simulation result, or undefined if the task cannot be executed (canExec === false)
 * @remarks If you need to throw errors on failure instead of returning undefined, use {@link validateSimulation}
 */
export declare function simulateTask<T>(args: SimulateTaskArgs<T>): Promise<SimulateCallsReturnType<Call[]>>;
