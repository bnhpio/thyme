import type { Address, Hex } from 'viem';
export interface Context<T> {
    userArgs: T;
    secrets: Secrets;
}
export interface Secrets {
    [key: string]: string;
}
export type FailResult = {
    canExec: false;
    message: string;
};
export type SuccessResult = {
    canExec: true;
    calls: Call[];
};
export type Result = FailResult | SuccessResult;
export type Call = {
    to: Address;
    data: Hex;
    value?: bigint;
};
export type RunCallback<T> = (context: Context<T>) => Promise<Result>;
export type FailCallback<T> = (context: Context<T>, result: Hex[], error?: Error) => Promise<void>;
export type SuccessCallback<T> = (context: Context<T>, result: Hex[]) => Promise<void>;
export interface Runner<T> {
    run: RunCallback<T>;
    fail: FailCallback<T>;
    success: SuccessCallback<T>;
}
export interface SimulateTaskArgs<T> {
    runner: Runner<T>;
    options: {
        account: Address;
        rpcUrl: string;
    };
    context: {
        userArgs: T;
        secrets: Secrets;
    };
}
export declare function onRun<T>(callback: RunCallback<T>): RunCallback<T>;
export declare function onFail<T>(callback: FailCallback<T>): FailCallback<T>;
export declare function onSuccess<T>(callback: SuccessCallback<T>): SuccessCallback<T>;
export declare class NotExecutableError extends Error {
    constructor(message: string);
}
