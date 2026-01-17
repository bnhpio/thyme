import type { Context, Result } from '../runner';
export interface SandboxArguments<T> {
    file: string;
    context: Context<T>;
}
export interface SandboxResult {
    logs: string[];
    result: Result;
}
