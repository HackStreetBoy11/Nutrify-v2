import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ✅ Get user's goal by date
export const getGoalByDate = query({
  args: { userId: v.id("users"), date: v.string() },
  handler: async (ctx, args) => {
    const goal = await ctx.db
      .query("userGoals")
      .filter((q) =>
        q.and(q.eq(q.field("userId"), args.userId), q.eq(q.field("date"), args.date))
      )
      .first();

    return goal;
  },
});

// ✅ Create or Update Goal
export const setGoal = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fats: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if goal already exists
    const existing = await ctx.db
      .query("userGoals")
      .filter((q) =>
        q.and(q.eq(q.field("userId"), args.userId), q.eq(q.field("date"), args.date))
      )
      .first();

    if (existing) {
      // Update existing goal
      await ctx.db.patch(existing._id, {
        calories: args.calories,
        protein: args.protein,
        carbs: args.carbs,
        fats: args.fats,
      });
      return existing._id;
    } else {
      // Create new goal
      return await ctx.db.insert("userGoals", args);
    }
  },
});
