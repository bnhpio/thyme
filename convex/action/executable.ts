'use node';

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as vm from 'node:vm';
import { runTask as runTaskSDK } from '@bnhpio/thyme-sdk/task/transaction';
import { v } from 'convex/values';
import { type Hex, keccak256, toHex } from 'viem';
import { internal } from '../_generated/api';
import { internalAction } from '../_generated/server';
import { logger } from './logger';

/**
 * Creates a secure proxy that blocks access to sensitive properties
 */
function createSecureProxy(target: any, blockedProps: string[]): any {
  return new Proxy(target, {
    get: (obj, prop) => {
      const propStr = String(prop);
      if (blockedProps.includes(propStr)) {
        throw new ReferenceError(
          `Access to '${propStr}' is not allowed in user code`,
        );
      }
      return obj[prop];
    },
    set: (obj, prop, value) => {
      const propStr = String(prop);
      if (blockedProps.includes(propStr)) {
        throw new ReferenceError(
          `Setting '${propStr}' is not allowed in user code`,
        );
      }
      obj[prop] = value;
      return true;
    },
    has: (obj, prop) => {
      const propStr = String(prop);
      if (blockedProps.includes(propStr)) {
        return false;
      }
      return prop in obj;
    },
  });
}

/**
 * Executes user code in a secure VM sandbox
 *
 * Security measures:
 * 1. VM context isolation (prevents access to outer scope)
 * 2. Proxy-based property blocking (prevents access to sensitive globals)
 * 3. Restricted code generation (blocks eval, Function constructor, WASM)
 * 4. Execution timeout (5 minutes max)
 *
 * Note: Node.js VM module provides context isolation but is not a perfect sandbox.
 * This implementation uses multiple layers of defense to prevent access to:
 * - process.env and other process properties
 * - File system (fs)
 * - Network modules (http, https, net, dns)
 * - Child processes
 * - Other Node.js built-in modules
 */
function executeSandboxedCode(
  userCode: string,
  tempFilePath: string,
): Promise<any> {
  // List of blocked properties that should never be accessible
  const blockedProps = [
    'process',
    '__dirname',
    '__filename',
    'global',
    'globalThis',
    'Buffer',
    'fs',
    'os',
    'path',
    'child_process',
    'crypto',
    'net',
    'dns',
    'http',
    'https',
    'tls',
    'stream',
    'util',
    'url',
    'querystring',
    'zlib',
    'readline',
    'repl',
    'vm',
    'v8',
    'worker_threads',
    'cluster',
    'perf_hooks',
  ];

  // Create a secure require function that only allows SDK imports
  const createSecureRequire = () => {
    return (moduleName: string) => {
      // Only allow imports from @bnhpio/thyme-sdk
      if (moduleName.startsWith('@bnhpio/thyme-sdk')) {
        // Use require to load the SDK module
        // Note: This requires the SDK to be available in node_modules
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require(moduleName);
        } catch {
          throw new Error(
            `Failed to load module: ${moduleName}. SDK modules must be available.`,
          );
        }
      }
      throw new Error(
        `Import of '${moduleName}' is not allowed. Only @bnhpio/thyme-sdk modules are permitted.`,
      );
    };
  };

  // Create a secure sandbox context with minimal globals
  const baseSandbox = {
    // Only allow safe JavaScript globals
    console: {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    },
    // Provide secure require function for SDK imports
    require: createSecureRequire(),
    // Provide module and exports for CommonJS compatibility
    module: { exports: {} },
    exports: {},
    // Standard JavaScript objects
    Object,
    Array,
    String,
    Number,
    Boolean,
    Date,
    Math,
    JSON,
    Promise,
    Error,
    TypeError,
    ReferenceError,
    SyntaxError,
    RangeError,
    URIError,
    // Allow setTimeout/setInterval for async operations
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    // Typed arrays
    Uint8Array,
    Uint16Array,
    Uint32Array,
    Int8Array,
    Int16Array,
    Int32Array,
    Float32Array,
    Float64Array,
    ArrayBuffer,
    DataView,
    // Map and Set
    Map,
    Set,
    WeakMap,
    WeakSet,
    // Symbol
    Symbol,
    // RegExp
    RegExp,
    // Proxy (but we'll restrict its usage)
    Proxy,
  };

  // Wrap sandbox in a proxy to block access to sensitive properties
  const sandbox = createSecureProxy(baseSandbox, blockedProps);

  // Create VM context with timeout
  const context = vm.createContext(sandbox, {
    name: 'UserTaskSandbox',
    codeGeneration: {
      strings: false, // Prevent string-based code generation (eval-like)
      wasm: false, // Disable WebAssembly
    },
  });

  // Transform ES6 import statements to require() calls
  // ES6: import { x } from 'module' -> const { x } = require('module')
  // ES6: import x from 'module' -> const x = require('module').default || require('module')
  let transformedCode = userCode;

  // Strip TypeScript type-only imports (they don't exist at runtime)
  // Match: import type ... from 'module'
  transformedCode = transformedCode.replace(
    /import\s+type\s+.*?from\s+['"]([^'"]+)['"];?/g,
    '',
  );

  // Convert ES6 import statements to require() calls
  // Match: import ... from 'module'
  transformedCode = transformedCode.replace(
    /import\s+(\{[\s\S]*?\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"];?/g,
    (_match, imports, moduleName) => {
      // Only allow SDK imports
      if (!moduleName.startsWith('@bnhpio/thyme-sdk')) {
        throw new Error(
          `Import of '${moduleName}' is not allowed. Only @bnhpio/thyme-sdk modules are permitted.`,
        );
      }

      // Handle different import patterns
      if (imports.startsWith('{')) {
        // Named imports: import { a, b } from 'module'
        return `const ${imports} = require('${moduleName}');`;
      }
      if (imports.startsWith('*')) {
        // Namespace import: import * as name from 'module'
        return `const ${imports.replace('* as', '')} = require('${moduleName}');`;
      }
      // Default import: import name from 'module'
      return `const ${imports} = require('${moduleName}').default || require('${moduleName}');`;
    },
  );

  // Transform ES6 default export to CommonJS module.exports
  // Match: export default ... (handles both single-line and multi-line)
  // Use a more robust pattern that matches until end of string
  const exportDefaultRegex = /export\s+default\s+([\s\S]*)$/;
  if (exportDefaultRegex.test(transformedCode)) {
    transformedCode = transformedCode.replace(
      exportDefaultRegex,
      (_match, exportValue) => {
        // Remove trailing semicolon and whitespace/newlines
        const cleanValue = exportValue.trim().replace(/;?\s*$/, '');
        return `module.exports = ${cleanValue};`;
      },
    );
  }

  // Wrap user code to handle default exports
  const wrappedCode = `
    (function() {
      'use strict';
      
      // Reset module/exports for each execution
      const module = { exports: {} };
      const exports = module.exports;
      
      // User code executes here (with imports converted to require)
      ${transformedCode}
      
      // Handle ES6 default export or CommonJS export
      if (typeof module.exports === 'object' && module.exports !== null) {
        // If it's an object with a default property, use that
        if (module.exports.default) {
          return module.exports.default;
        }
        // Otherwise return the whole exports object
        return module.exports;
      }
      // If it's a function or other value, return it
      if (typeof module.exports !== 'undefined') {
        return module.exports;
      }
      return undefined;
    })();
  `;

  // Execute in VM with timeout
  const script = new vm.Script(wrappedCode, {
    filename: tempFilePath,
    lineOffset: 0,
    columnOffset: 0,
    produceCachedData: false,
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Code execution timeout'));
    }, 300000); // 5 minute timeout

    try {
      const result = script.runInContext(context, {
        timeout: 300000, // 5 minute timeout
        breakOnSigint: false,
        displayErrors: true,
      });
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

// Wrapper action that checks conditions before execution
// This follows the pattern from https://stack.convex.dev/cron-jobs#statically-defined-cron-jobs
// where we use reliable mutations/actions to check state before executing potentially unreliable work
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
    await executeTask(ctx, args.executableId, executable);

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
async function executeTask(ctx: any, executableId: any, executable: any) {
  const internalLogger = logger(ctx, executableId);

  // Get task
  const task = await ctx.runQuery(internal.query.task.getTaskById, {
    taskId: executable.taskId,
  });

  if (!task) {
    await internalLogger.error(['Task not found']);
    return;
  }

  // Get chain info
  const chain = await ctx.runQuery(internal.query.chain.getChainById, {
    chainId: executable.chain,
  });

  if (!chain) {
    await internalLogger.error(['Chain not found']);
    return;
  }

  // Get profile
  const profile = await ctx.runQuery(internal.query.profile.getProfileById, {
    profileId: executable.profile,
  });

  if (!profile) {
    await internalLogger.error(['Profile not found']);
    return;
  }

  // Get task code from storage
  const taskCode = (await ctx.runAction(
    internal.action.task.getTaskCodeInternal,
    {
      storageId: task.hash,
    },
  )) as string;

  if (!taskCode) {
    await internalLogger.error(['Task code not found']);
    return;
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
    await internalLogger.error([
      'ALCHEMY_API_KEY environment variable is not set',
    ]);
    return;
  }

  // Get Alchemy Policy ID from environment
  const alchemyPolicyId = process.env.ALCHEMY_POLICY_ID;
  if (!alchemyPolicyId) {
    await internalLogger.error([
      'ALCHEMY_POLICY_ID environment variable is not set',
    ]);
    return;
  }

  // Get private key from environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    await internalLogger.error(['PRIVATE_KEY environment variable is not set']);
    return;
  }

  // Execute the task using runTask from thyme-sdk
  // This is the potentially unreliable work that might fail
  let tempFilePath: string | null = null;
  try {
    tempFilePath = path.join(
      os.tmpdir(),
      `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.js`,
    );

    // Write the user code to a temporary file (for debugging/error messages)
    fs.writeFileSync(tempFilePath, taskCode, 'utf8');

    // Execute code in secure VM sandbox
    const exported = await executeSandboxedCode(taskCode, tempFilePath);

    if (!exported) {
      await internalLogger.error([
        'Task code must export a default value (object with run, fail, success methods)',
      ]);
      return;
    }

    // Extract the runner function from the exported object
    // User code exports: { run, fail, success }
    let runner: any;
    if (typeof exported === 'object' && exported !== null) {
      // If it's an object, extract the run function
      runner = exported.run;
      if (!runner || typeof runner !== 'function') {
        await internalLogger.error([
          'Task code must export an object with a run function',
        ]);
        return;
      }
    } else if (typeof exported === 'function') {
      // If it's directly a function, use it as the runner
      runner = exported;
    } else {
      await internalLogger.error([
        'Task code must export a function or an object with a run function',
      ]);
      return;
    }

    const saltBase = btoa(profile.alias).concat(
      executable.organization.toString(),
    );

    await runTaskSDK({
      runner,
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
      utils: internalLogger,
    });
  } catch (error) {
    if (error instanceof Error) {
      await internalLogger.error([error.message]);
    } else {
      await internalLogger.error(['Unknown error']);
    }
    // Note: We don't throw here - failures in execution don't stop the cron
    // The rescheduler will continue to run regardless of execution success/failure
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupError) {
        // Log but don't throw - cleanup errors shouldn't break execution
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }
  }
}
