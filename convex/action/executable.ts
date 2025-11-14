'use node';

import { sandbox } from '@bnhpio/thyme-sdk/sandbox';
import { v } from 'convex/values';
import {
  type Call,
  createPublicClient,
  type Hex,
  http,
  keccak256,
  toHex,
} from 'viem';
import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import { internalAction } from '../_generated/server';
import {
  type AlchemyOptions,
  createAlchemyClient,
} from './node/createSmartAccount';

export const runTask = internalAction({
  args: {
    executableId: v.id('executables'),
  },
  handler: async (ctx, args) => {
    // Get executable to check status and conditions
    const executable = await ctx.runQuery(
      internal.query.executable.getExecutableByIdInternal,
      {
        executableId: args.executableId,
      },
    );

    if (!executable) {
      // Executable was deleted, silently return
      return;
    }

    // Check if executable is still active
    if (executable.status !== 'active') {
      // Executable is paused, finished, or failed - don't run
      return;
    }

    // Check if cron has expired (until timestamp)
    if (executable.trigger.type === 'cron' && executable.trigger.until) {
      const now = Date.now();
      if (now > executable.trigger.until) {
        // Cron has expired, mark as finished and stop
        await ctx.runMutation(internal.mutation.executable.markFinished, {
          executableId: args.executableId,
        });
        return;
      }
    }

    // All checks passed, execute the task
    await executeTask(ctx, executable);

    // For single-run executables, mark as finished after execution
    if (executable.trigger.type === 'single') {
      await ctx.runMutation(internal.mutation.executable.markFinished, {
        executableId: args.executableId,
      });
    }
  },
});

// Execution action - this is the actual work that might fail
// It's scheduled separately from the rescheduler to ensure reliability
async function executeTask(
  ctx: any,
  executable: {
    taskId: Id<'tasks'>;
    chain: Id<'chains'>;
    profile: Id<'profiles'>;
    args: string;
  },
) {
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

  const result = await sandbox({
    file: taskCode,
    context: {
      userArgs: parsedArgs,
      secrets: {},
    },
  });
  if (result.result.canExec) {
    const txs = await sendAlchemyCalls({
      calls: result.result.calls,
      options: {
        privateKey: privateKey as Hex,
        rpcUrl: chain.rpcUrls[0],
        alchemyOptions: {
          apiKey: alchemyApiKey,
          policyId: alchemyPolicyId,
          salt: keccak256(toHex(profile.salt)),
          baseUrl: chain.baseUrl,
        },
      },
    });
    console.log('txs', txs);
  }
}

export interface SendCallsAlchemyOptions {
  calls: Call[];
  options: {
    privateKey: Hex;
    rpcUrl: string;
    alchemyOptions: AlchemyOptions;
  };
}

export async function sendAlchemyCalls(
  args: SendCallsAlchemyOptions,
): Promise<Hex[]> {
  const publicClient = createPublicClient({
    transport: http(args.options.rpcUrl),
  });
  const chainId = await publicClient.getChainId();
  const { client, account } = await createAlchemyClient(
    args.options.privateKey,
    args.options.alchemyOptions,
    chainId,
  );
  const preparedCalls = await client.prepareCalls({
    calls: args.calls.map((call) => ({
      to: call.to,
      data: call.data,
    })),

    from: account,
    capabilities: {
      paymasterService: {
        policyId: args.options.alchemyOptions.policyId,
      },
    },
  });
  try {
    const signedCalls = await client.signPreparedCalls(preparedCalls);
    const result = await client.sendPreparedCalls(signedCalls);
    const callsStatus = await client.waitForCallsStatus({
      id: result.preparedCallIds[0],
    });
    const tsx =
      callsStatus.receipts?.map((receipt) => receipt.transactionHash) || [];
    if (callsStatus.status !== 'success') {
      throw new Error('Failed to send alchemy calls');
    }
    return tsx;
  } catch (error) {
    console.error('Error sending alchemy calls:', error);
    throw error;
  }
}
