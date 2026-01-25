import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  chainId: v.number(),
  name: v.string(),
  rpcUrls: v.array(v.string()),
  explorerUrl: v.optional(v.string()),
  nativeCurrency: v.object({
    name: v.string(),
    symbol: v.string(),
    decimals: v.number(),
  }),
  isTestnet: v.boolean(),
  isEnabled: v.boolean(),
  priority: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_chain_id', ['chainId'])
  .index('by_enabled', ['isEnabled']);
