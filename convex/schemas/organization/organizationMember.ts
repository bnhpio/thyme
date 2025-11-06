import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(), // Temporarily back to string for migration
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.string(), // "admin", "member", "viewer"
    status: v.string(), // "active", "pending", "suspended"
    joinedAt: v.number(),
    invitedBy: v.optional(v.string()), // Temporarily back to string for migration
    invitedAt: v.optional(v.number()),
})
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]);
