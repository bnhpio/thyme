import { createPublicClient, http } from "viem";
async function simulateCalls(args) {
    const publicClient = createPublicClient({
        transport: http(args.options.rpcUrl)
    });
    const simulatedTransaction = await publicClient.simulateCalls({
        calls: args.calls,
        account: args.options.account
    });
    return simulatedTransaction;
}
export { simulateCalls };
