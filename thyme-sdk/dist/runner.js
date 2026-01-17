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
function onRun(callback) {
    return async (context)=>callback(context);
}
function onFail(callback) {
    return async (context, result, error)=>callback(context, result, error);
}
function onSuccess(callback) {
    return async (context, result)=>callback(context, result);
}
class NotExecutableError extends Error {
    constructor(message){
        super(message);
        this.name = 'NotExecutableError';
    }
}
async function simulateTask(args) {
    const context = {
        userArgs: args.context.userArgs,
        secrets: args.context.secrets || {}
    };
    const result = await args.runner.run(context);
    if (false === result.canExec) throw new NotExecutableError(`${result.message}`);
    return simulateCalls({
        calls: result.calls,
        options: {
            account: args.options.account,
            rpcUrl: args.options.rpcUrl
        }
    });
}
export { NotExecutableError, onFail, onRun, onSuccess, simulateTask };
