import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
    userId: v.id("users"), // Reference to the user
    currentOrganizationId: v.optional(v.id("organizations")), // Currently selected organization
    preferences: v.object({
        theme: v.optional(v.string()), // "light", "dark", "system"
        language: v.optional(v.string()), // "en", "es", etc.
        notifications: v.optional(v.object({
            email: v.boolean(),
            push: v.boolean(),
            organizationUpdates: v.boolean(),
        })),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
})
    .index("by_user", ["userId"]);
