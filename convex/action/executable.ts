'use node';

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runTask as runTaskSDK } from '@bnhpio/thyme-sdk/task/transaction';
import { v } from 'convex/values';
import { type Hex, keccak256, toHex } from 'viem';
import { internal } from '../_generated/api';
import { action, internalAction } from '../_generated/server';
import { autumn } from '../autumn';

// Execution action - this is the actual work that might fail
// It's scheduled separately from the rescheduler to ensure reliability
export const runTask = internalAction({
  args: {
    executableId: v.id('executables'),
  },
  handler: async (ctx, args) => {
    const executable = await ctx.runQuery(
      internal.query.executable.getExecutableByIdInternal,
      {
        executableId: args.executableId,
      },
    );

    if (!executable) {
      throw new Error('Executable not found');
    }

    const executionsLimit = await ctx.runAction(
      internal.action.executable.checkExecutionsLimit,
      {
        organizationId: executable.organization,
      },
    );

    //TODO: We need to pause next jobs here, and handle cron jobs here.
    if (!executionsLimit.allowed && executionsLimit.reason) {
      throw new Error(executionsLimit.reason);
    }

    await ctx.runAction(internal.action.executable._runTask, {
      executableId: args.executableId,
    });
    await ctx.runAction(internal.action.executable.trackExecutionsAdded, {
      organizationId: executable.organization,
    });
  },
});

export const _runTask = internalAction({
  args: {
    executableId: v.id('executables'),
  },
  handler: async (ctx, args) => {
    // Get executable
    const executable = await ctx.runQuery(
      internal.query.executable.getExecutableByIdInternal,
      {
        executableId: args.executableId,
      },
    );

    if (!executable) {
      throw new Error('Executable not found');
    }
    executable.organization;

    // Get task
    const task = await ctx.runQuery(internal.query.task.getTaskById, {
      taskId: executable.taskId,
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Get chain info
    const chain = await ctx.runQuery(internal.query.chain.getChainById, {
      chainId: executable.chain,
    });

    if (!chain) {
      throw new Error('Chain not found');
    }

    // Get profile
    const profile = await ctx.runQuery(internal.query.profile.getProfileById, {
      profileId: executable.profile,
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Get task code from storage
    const taskCode = (await ctx.runAction(
      internal.action.task.getTaskCodeInternal,
      {
        storageId: task.hash,
      },
    )) as string;

    if (!taskCode) {
      throw new Error('Task code not found');
    }
    // Parse args
    let parsedArgs: Record<string, unknown> = {};
    try {
      parsedArgs = JSON.parse(executable.args);
    } catch {
      console.error('Error parsing args', executable.args);
      // If args is not valid JSON, use empty object
      parsedArgs = {};
    }

    // Get Alchemy API key from environment
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyApiKey) {
      throw new Error('ALCHEMY_API_KEY environment variable is not set');
    }

    // Get Alchemy Policy ID from environment
    const alchemyPolicyId = process.env.ALCHEMY_POLICY_ID;
    if (!alchemyPolicyId) {
      throw new Error('ALCHEMY_POLICY_ID environment variable is not set');
    }

    // Get private key from environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is not set');
    }

    // Execute the task using runTask from thyme-sdk
    // Note: The exact parameter names may need to be verified against the SDK
    try {
      const tempFilePath = path.join(
        os.tmpdir(),
        `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.js`,
      );

      // Write the minified JavaScript to a temporary file
      fs.writeFileSync(tempFilePath, taskCode, 'utf8');
      const exec = await import(tempFilePath);
      const saltBase = btoa(profile.alias).concat(
        executable.organization.toString(),
      );

      await runTaskSDK({
        runner: exec.default,
        options: {
          privateKey: privateKey as Hex,
          rpcUrl: chain.rpcUrls[0] || '',
          alchemyOptions: {
            apiKey: alchemyApiKey,
            salt: keccak256(toHex(saltBase)),
            policyId: alchemyPolicyId,
            baseUrl: chain.baseUrl || '',
          },
          skipSimulation: false,
          skipSuccessCallback: false,
          skipFailCallback: false,
        },
        context: {
          userArgs: parsedArgs,
          secrets: undefined,
        },
      });
    } catch (error) {
      // Log error but don't throw - the rescheduler will continue
      console.error(
        `Error executing task for executable ${args.executableId}:`,
        error,
      );
    }
  },
});
export const checkActiveJobsLimit = internalAction({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.object({
    allowed: v.boolean(),
    reason: v.union(v.string(), v.null()),
  }),
  handler: async (
    ctx,
    _args,
  ): Promise<{
    allowed: boolean;
    reason: string | null;
  }> => {
    const result = await autumn.check(ctx, {
      featureId: 'concurrent_jobs',
    });

    if (result.error || !result.data?.allowed) {
      throw new Error('Active jobs limit exceeded');
    }

    return {
      allowed: result.data.allowed,
      reason: null,
    };
  },
});
export const trackActiveJobsRemoved = internalAction({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, _args) => {
    const result = await autumn.track(ctx, {
      featureId: 'concurrent_jobs',
      value: -1,
    });

    if (result.error) {
      throw new Error(
        `Failed to track active jobs removal: ${result.error.message || 'Unknown error'}`,
      );
    }

    return result.data;
  },
});

export const trackActiveJobsAdded = internalAction({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx) => {
    const result = await autumn.track(ctx, {
      featureId: 'concurrent_jobs',
      value: 1,
    });

    if (result.error) {
      throw new Error(
        `Failed to track active jobs addition: ${result.error.message || 'Unknown error'}`,
      );
    }

    return result.data;
  },
});

export const checkExecutionsLimit = internalAction({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.object({
    allowed: v.boolean(),
    reason: v.union(v.string(), v.null()),
  }),
  handler: async (
    ctx,
    _args,
  ): Promise<{
    allowed: boolean;
    reason: string | null;
  }> => {
    const result = await autumn.check(ctx, {
      featureId: 'executions_limit',
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (!result.data?.allowed) {
      return {
        allowed: false,
        reason: 'Executions limit exceeded',
      };
    }

    return {
      allowed: result.data.allowed,
      reason: null,
    };
  },
});
export const trackExecutionsRemoved = internalAction({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, _args) => {
    const result = await autumn.track(ctx, {
      featureId: 'executions_limit',
      value: -1,
    });

    if (result.error) {
      throw new Error(
        `Failed to track executions removal: ${result.error.message || 'Unknown error'}`,
      );
    }

    return result.data;
  },
});

export const trackExecutionsAdded = internalAction({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx) => {
    const result = await autumn.track(ctx, {
      featureId: 'executions_limit',
      value: 1,
    });

    if (result.error) {
      throw new Error(
        `Failed to track executions addition: ${result.error.message || 'Unknown error'}`,
      );
    }

    return result.data;
  },
});

export const createExecutable = action({
  args: {
    taskId: v.id('tasks'),
    name: v.string(),
    organizationId: v.id('organizations'),
    chainId: v.id('chains'),
    profileId: v.id('profiles'),
    args: v.string(),
    trigger: v.union(
      v.object({
        type: v.literal('cron'),
        schedule: v.string(),
        withRetry: v.boolean(),
        until: v.optional(v.number()),
      }),
      v.object({
        type: v.literal('single'),
        timestamp: v.number(),
        withRetry: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.action.executable.checkActiveJobsLimit, {
      organizationId: args.organizationId,
    });
    await ctx.runAction(internal.action.executable.trackActiveJobsAdded, {
      organizationId: args.organizationId,
    });
    await ctx.runMutation(internal.mutation.executable.createExecutable, {
      ...args,
    });
  },
});
