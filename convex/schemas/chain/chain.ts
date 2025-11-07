import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  chainId: v.number(),
  rpcUrls: v.array(v.string()),
  baseUrl: v.optional(v.string()),
}).index('by_chain_id', ['chainId']);
