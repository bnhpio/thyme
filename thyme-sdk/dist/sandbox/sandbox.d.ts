import type { SandboxArguments, SandboxResult } from './types';
export declare function sandbox<T>(args: SandboxArguments<T>): Promise<SandboxResult>;
