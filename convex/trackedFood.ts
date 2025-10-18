import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * ✅ Mutation: Add a tracked food entry
 */
export const addTrackedFood = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    quantity: v.number(),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fats: v.optional(v.number()),
    date: v.string(),

  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trackedFood", args);
  },
});
/**
 * ✅ Query: Get all tracked foods for a user
 */
export const getTrackedFoods = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trackedFood")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
