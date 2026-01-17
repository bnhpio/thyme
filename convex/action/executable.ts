'use node';

import type { SmartWalletClient } from '@account-kit/wallet-client';
import { Sandbox } from '@deno/sandbox';
import { v } from 'convex/values';
import {
  type Address,
  type Call,
  createPublicClient,
  type Hex,
  http,
  keccak256,
  type PublicClient,
  parseUnits,
  toHex,
} from 'viem';
import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import { type ActionCtx, action, internalAction } from '../_generated/server';
import { autumn } from '../autumn';
import { simulateCalls } from '../utils/simulateCalls';
import {
  type AlchemyOptions,
  createAlchemyClient,
} from './node/createSmartAccount';

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

    //TODO: Move this below execution, we need to update counter only if execution was successful.
    await ctx.runAction(internal.action.executable.trackExecutionsAdded, {
      organizationId: executable.organization,
    });

    await ctx.runAction(internal.action.executable._runTask, {
      executableId: args.executableId,
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
      // Executable was deleted, silently return
      return;
    }
    executable.organization;

    // Check if executable is still active
    if (executable.status !== 'active') {
      // Executable is paused - don't run
      return;
    }

    const { executionId } = await ctx.runMutation(
      internal.mutation.executable.createExecution,
      {
        executableId: executable._id,
      },
    );
    try {
      await executeTask(ctx, {
        executableId: executable._id,
        taskId: executable.taskId,
        chain: executable.chain,
        profile: executable.profile,
        organization: executable.organization,
        args: executable.args,
        executionId,
      });
    } catch (error) {
      await ctx.runMutation(internal.mutation.executable.failUnknownError, {
        executionId,
        errorReason: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
    // All checks passed, execute the task
  },
});

export const terminateExecutable = action({
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
    const res = await ctx.runMutation(
      internal.mutation.executable.terminateExecutable,
      {
        executableId: args.executableId,
      },
    );

    if (!res.success) {
      throw new Error(
        res.reason ?? 'Executable must be paused before termination',
      );
    }

    await ctx.runAction(internal.action.executable.trackActiveJobsRemoved, {
      organizationId: executable.organization,
    });
  },
});

export const pauseExecutable = action({
  args: {
    executableId: v.id('executables'),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const executable = await ctx.runQuery(
      internal.query.executable.getExecutableByIdInternal,
      {
        executableId: args.executableId,
      },
    );
    if (!executable) {
      throw new Error('Executable not found');
    }

    if (executable.status === 'paused') {
      return { success: false };
    }

    const result = await ctx.runMutation(
      internal.mutation.executable.pauseExecutable,
      {
        executableId: args.executableId,
      },
    );

    if (result.success) {
      await ctx.runAction(internal.action.executable.trackActiveJobsRemoved, {
        organizationId: executable.organization,
      });
    }

    return result;
  },
});

export const renameExecutable = action({
  args: {
    executableId: v.id('executables'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.mutation.executable.renameExecutable, {
      executableId: args.executableId,
      name: args.name,
    });
  },
});

export const resumeExecutable = action({
  args: {
    executableId: v.id('executables'),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const executable = await ctx.runQuery(
      internal.query.executable.getExecutableByIdInternal,
      {
        executableId: args.executableId,
      },
    );
    if (!executable) {
      throw new Error('Executable not found');
    }

    if (executable.status === 'active') {
      return { success: false };
    }

    await ctx.runAction(internal.action.executable.checkActiveJobsLimit, {
      organizationId: executable.organization,
    });

    const result = await ctx.runMutation(
      internal.mutation.executable.resumeExecutable,
      {
        executableId: args.executableId,
      },
    );

    if (result.success) {
      await ctx.runAction(internal.action.executable.trackActiveJobsAdded, {
        organizationId: executable.organization,
      });
    }

    return result;
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
    const organization = await ctx.runQuery(
      internal.query.organization.getOrganizationAutumnDataByOrganizationId,
      {
        organizationId: _args.organizationId,
      },
    );
    const result = await autumn.check(
      { custom: organization },
      {
        featureId: 'concurrent_jobs',
      },
    );

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
    const organization = await ctx.runQuery(
      internal.query.organization.getOrganizationAutumnDataByOrganizationId,
      {
        organizationId: _args.organizationId,
      },
    );
    const result = await autumn.track(
      { custom: organization },
      {
        featureId: 'concurrent_jobs',
        value: -1,
      },
    );

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
    const result = await autumn.track(
      { ctx },
      {
        featureId: 'concurrent_jobs',
        value: 1,
      },
    );

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
    const organization = await ctx.runQuery(
      internal.query.organization.getOrganizationAutumnDataByOrganizationId,
      {
        organizationId: _args.organizationId,
      },
    );
    const result = await autumn.check(
      {
        custom: organization,
      },
      {
        featureId: 'executions_limit',
      },
    );

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

export const trackExecutionsAdded = internalAction({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.runQuery(
      internal.query.organization.getOrganizationAutumnDataByOrganizationId,
      {
        organizationId: args.organizationId,
      },
    );
    const result = await autumn.track(
      { custom: organization },
      {
        featureId: 'executions_limit',
        value: 1,
      },
    );

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
      }),
      v.object({
        type: v.literal('interval'),
        interval: v.number(),
        startAt: v.optional(v.number()),
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

// Execution action - this is the actual work that might fail
// It's scheduled separately from the rescheduler to ensure reliability
async function executeTask(
  ctx: ActionCtx,
  executable: {
    taskId: Id<'tasks'>;
    chain: Id<'chains'>;
    profile: Id<'profiles'>;
    executableId: Id<'executables'>;
    executionId: Id<'taskExecutions'>;
    organization: Id<'organizations'>;
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

  // Get Deno Sandbox token
  const denoToken = process.env.DENO_SANDBOX_TOKEN;
  if (!denoToken) {
    throw new Error('DENO_SANDBOX_TOKEN environment variable is not set');
  }

  // Get RPC URL from organization chain settings
  const rpcUrl = await ctx.runQuery(
    internal.query.organizationChainRpc.getChainRpcUrl,
    {
      organizationId: executable.organization,
      chainId: chain.chainId,
    },
  );

  // Create Deno sandbox
  const sandbox = await Sandbox.create({
    region: 'ams',
    debug: true,
    token: denoToken,
    memoryMb: 1024,
    env: {
      RPC_URL: rpcUrl,
    },
  });

  let result: { canExec: boolean; calls: Call[]; message?: string };
  const logs: string[] = [];

  try {
    // Write bundled task code to sandbox
    await sandbox.fs.writeTextFile('task.js', taskCode);

    // Create execution wrapper
    const wrapperCode = `
import task from './task.js';
import { createPublicClient, http } from 'npm:viem@2.44.4';

const client = createPublicClient({
  transport: http(Deno.env.get('RPC_URL'))
});

const context = {
  args: ${JSON.stringify(parsedArgs)},
  client
};

try {
  const result = await task.run(context);
  console.log('__THYME_RESULT__' + JSON.stringify(result));
} catch (error) {
  console.error('Task execution error:', error instanceof Error ? error.message : String(error));
  Deno.exit(1);
}
`;

    await sandbox.fs.writeTextFile('wrapper.js', wrapperCode);

    // Execute task - write result to file since stdout capture seems unreliable
    await sandbox.sh`deno run --allow-read --allow-write --allow-net --allow-env wrapper.js > output.txt 2>&1`;

    // Read output from file
    const stdoutText = await sandbox.fs.readTextFile('output.txt');

    const lines = stdoutText.trim().split('\n');
    let resultLine: string | undefined;

    for (const line of lines) {
      if (line.startsWith('__THYME_RESULT__')) {
        resultLine = line.substring('__THYME_RESULT__'.length);
      } else if (line.trim()) {
        logs.push(line.trim());
      }
    }

    if (!resultLine) {
      throw new Error(`No result found in task output\nOutput:\n${stdoutText}`);
    }

    result = JSON.parse(resultLine);
  } finally {
    await sandbox.close();
  }

  // Add logs to the execution
  try {
    await ctx.runMutation(internal.mutation.log.log, {
      executableId: executable.executableId,
      executionId: executable.executionId,
      log: logs.reverse(),
    });
  } catch (error) {
    console.error('Error adding logs to the execution:', error);
  }

  // Start simulation
  const simulationResult = await ctx.runMutation(
    internal.mutation.executable.startSimulation,
    {
      executionId: executable.executionId,
    },
  );
  if (!simulationResult.success) {
    throw new Error('Failed to start simulation');
  }

  // Simulate calls
  try {
    await simulateCalls({
      calls: result.calls,
      options: {
        rpcUrl: rpcUrl,
        account: profile.address as Address,
      },
    });
  } catch (error) {
    console.error('Error simulating calls:', error);
    await ctx.runMutation(internal.mutation.executable.failSimulation, {
      executionId: executable.executionId,
      errorReason: error instanceof Error ? error.message : 'Simulation failed',
    });
    return;
  }

  if (result.canExec) {
    await ctx.runMutation(internal.mutation.executable.startSending, {
      executionId: executable.executionId,
    });
    const { preparedCallIds, client, publicClient } = await sendAlchemyCalls({
      calls: result.calls,
      options: {
        privateKey: privateKey as Hex,
        rpcUrl: rpcUrl,
        alchemyOptions: {
          apiKey: alchemyApiKey,
          policyId: alchemyPolicyId,
          salt: keccak256(toHex(profile.salt)),
          baseUrl: chain.baseUrl || '',
        },
      },
    });
    const gasPrice = await publicClient.getGasPrice();
    await ctx.runMutation(internal.mutation.executable.startValidating, {
      executionId: executable.executionId,
    });

    const callsStatuses = await Promise.all(
      preparedCallIds.map(async (preparedCallId) => {
        return client.waitForCallsStatus({
          id: preparedCallId,
        });
      }),
    );
    const hashes: Hex[] = [];
    for (const callStatus of callsStatuses) {
      hashes.push(
        ...(callStatus.receipts?.map((receipt) => receipt.transactionHash) ??
          []),
      );
    }
    const isFailed = callsStatuses.some(
      (callStatus) => callStatus.status === 'failure',
    );
    const executionCoef = parseUnits('1', 18); // @todo
    const gasUsed = callsStatuses.reduce(
      (acc, callStatus) =>
        acc +
        (callStatus.receipts?.reduce(
          (acc, receipt) => acc + receipt.gasUsed,
          0n,
        ) ?? 0n),
      0n,
    );
    if (isFailed) {
      await ctx.runMutation(internal.mutation.executable.failSending, {
        executionId: executable.executionId,
        transactionHashes: hashes,
        cost: {
          gas: gasUsed.toString(),
          gasPrice: gasPrice.toString(),
          price: (gasUsed * gasPrice).toString(),
          userPrice: (
            (gasUsed * gasPrice * executionCoef) /
            parseUnits('1', 18)
          ).toString(),
        },
      });
    } else {
      await ctx.runMutation(internal.mutation.executable.successSending, {
        executionId: executable.executionId,
        transactionHashes: hashes,
        cost: {
          gas: gasUsed.toString(),
          gasPrice: gasPrice.toString(),
          price: (gasUsed * gasPrice).toString(),
          userPrice: (
            (gasUsed * gasPrice * executionCoef) /
            parseUnits('1', 18)
          ).toString(),
        },
      });
    }
  } else {
    await ctx.runMutation(internal.mutation.executable.skipSimulation, {
      executionId: executable.executionId,
      errorReason: result.message || 'Simulation skipped',
    });
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

export async function sendAlchemyCalls(args: SendCallsAlchemyOptions): Promise<{
  preparedCallIds: Hex[];
  client: SmartWalletClient;
  publicClient: PublicClient;
}> {
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
    return { preparedCallIds: result.preparedCallIds, client, publicClient };
  } catch (error) {
    console.error('Error sending alchemy calls:', error);
    throw error;
  }
}
