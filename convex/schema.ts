import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        fullName: v.string(),
        email: v.string(),
        profilePic: v.optional(v.string()),
    }).index("by_clerk_id", ["clerkId"]),

    trackedFood: defineTable({
        userId: v.id("users"),
        name: v.string(),
        quantity: v.number(),
        calories: v.optional(v.number()),
        protein: v.optional(v.number()),
        carbs: v.optional(v.number()),
        fats: v.optional(v.number()),
        date: v.string(),
    }).index("by_user", ["userId"]),

    notifications: defineTable({
        userId: v.id("users"),
        type: v.union(
            v.literal("protein"),
            v.literal("calories"),
            v.literal("water"),
            v.literal("custom")
        ),
        message: v.string(),
        isRead: v.optional(v.boolean()),
        sentAt: v.optional(v.number()),
    }).index("by_user", ["userId"]),

});
