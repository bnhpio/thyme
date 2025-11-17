import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  executableId: v.id('executables'),
  change: v.union(
    v.literal('register'),
    v.literal('pause'),
    v.literal('resume'),
  ),
  user: v.id('users'),
  timestamp: v.number(),
}).index('by_executable', ['executableId']);
