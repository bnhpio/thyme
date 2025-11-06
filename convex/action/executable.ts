'use node';

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runTask as runTaskSDK } from '@bnhpio/thyme-sdk/task/transaction';
import { v } from 'convex/values';
import { type Hex, keccak256, toHex } from 'viem';
import { internal } from '../_generated/api';
import { internalAction } from '../_generated/server';

// Execution action - this is the actual work that might fail
// It's scheduled separately from the rescheduler to ensure reliability
export const runTask = internalAction({
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
