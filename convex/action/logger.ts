import type { GenericActionCtx } from 'convex/server';
import { internal } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';

export const logger = (
  ctx: GenericActionCtx<DataModel>,
  executableId: Id<'executables'>,
) => {
  return {
    log: async (log: string[]) => {
      await ctx.runMutation(internal.mutation.log.log, {
        executableId: executableId,
        log: log,
      });
    },
    warn: async (log: string[]) => {
      await ctx.runMutation(internal.mutation.log.warn, {
        executableId: executableId,
        log: log,
      });
    },
    error: async (log: string[]) => {
      await ctx.runMutation(internal.mutation.log.error, {
        executableId: executableId,
        log: log,
      });
    },
  };
};
