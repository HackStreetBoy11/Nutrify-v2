import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/*
  mutation : used for write operations --- inserting , updating or deleting data in your database
  query : Used for read operations --- fetching data from your database
  V: validator/typing utility for defining the expected shape and type of arguments (string, number,id etc..)
*/
/**
 * Add a tracked food entry
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
    // 1️⃣ Insert the new food
    const inserted = await ctx.db.insert("trackedFood", args);

    // 2️⃣ Fetch today's goal for this user
    const goal = await ctx.db
      .query("userGoals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .first();

    // 3️⃣ Get all tracked foods for this date to calculate total
    const foods = await ctx.db
      .query("trackedFood")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();

    // 4️⃣ Calculate totals
    const totals = foods.reduce(
      (acc, f) => ({
        calories: acc.calories + (f.calories || 0),
        protein: acc.protein + (f.protein || 0),
        carbs: acc.carbs + (f.carbs || 0),
        fats: acc.fats + (f.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // 5️⃣ Check if goal is reached
    if (goal) {
      if (totals.calories >= goal.calories) {
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "calories",
          message: "🎯 You’ve reached your calorie goal for today!",
          sentAt: Date.now(),
        });

        const user = await ctx.db.get(args.userId);
        await ctx.scheduler.runAfter(0, "email:sendGoalEmail" as any, {
          email: user!.email,
          subject: "🎯 Goal Completed!",
          message: "You’ve successfully reached your calorie target for today!",
        });

      }
      if (totals.protein >= goal.protein) {
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "protein",
          message: "💪 You’ve hit your protein target!",
          sentAt: Date.now(),
        });

        const user = await ctx.db.get(args.userId);
        await ctx.scheduler.runAfter(0, "email:sendGoalEmail" as any, {
          email: user!.email,
          subject: "🎯 Goal Completed!",
          message: "You’ve successfully reached your protein target for today!",
        });
      }
      if (totals.carbs >= goal.carbs) {
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "carbs",
          message: "🥖 You’ve completed your carbs goal!",
          sentAt: Date.now(),
        });

        const user = await ctx.db.get(args.userId);
        await ctx.scheduler.runAfter(0, "email:sendGoalEmail" as any, {
          email: user!.email,
          subject: "🎯 Goal Completed!",
          message: "You’ve successfully reached your carbs target for today!",
        });
      }
      if (totals.fats >= goal.fats) {
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "fats",
          message: "🧈 You’ve met your fats goal!",
          sentAt: Date.now(),
        });

        const user = await ctx.db.get(args.userId);
        await ctx.scheduler.runAfter(0, "email:sendGoalEmail" as any, {
          email: user!.email,
          subject: "🎯 Goal Completed!",
          message: "You’ve successfully reached your fats target for today!",
        });
      }
    }

    // 6️⃣ Return inserted food entry
    return inserted;
  },
});

/* 
Purpose: Add a food entry for a user.
args: Arguments passed from frontend --- all the data fields for a food entry
ctx.db.insert("trackedFood",args): Inserts a new row in the trackedFood table in the backend database

------ Frontend Use:
  await mutation('addTrackedFood', {
              userId: user.id,
              name: "Banana",
              calories: 100,
              protein: 1,
              carbs: 27,
              fat: 0,
              date: "2025-10-23",
              quantity: 1
});
  frontend sends this data -> ctx in backend handles inserting it securely.

*/
/**
 * Get all tracked foods for a user
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

/*
  Purpose: Fetch all food entries for a specific user on  a specific date.
  withIndex("by_userId",...): Efficiently finds all entries for the user (faster than scanning the whole table.)
  .filter(q=> q.eq(q.field("date"),args.date)): Further filters entries for a specific date.
  .collect(): Retrieves the results as an array.

  ---- Frontend Use
    const foods = await query('getTrackedFoods', { userId: user.id, date: "2025-10-23" });

*/


/**
 * Delete a tracked food entry by ID
 */
export const deleteFood = mutation({
  args: { foodId: v.id("trackedFood") },
  handler: async (ctx, { foodId }) => {
    await ctx.db.delete(foodId);
    return { success: true };
  },
});

/*
  Purpose : Delete a tracked food entry by its unique ID.
  ctx.db.delete(args.id): Removes that row from the database.

  ------- Frontend Use:
  await mutation('deleteFood', { id: foodId });
  Frontend sends the id → backend safely deletes the entry.
*/



// SUMMARY----
// Key Points About ctx
// ctx.db → Database access.
// ctx acts as a bridge between frontend requests and backend database operations.
// All logic runs securely on the backend, so frontend cannot manipulate the database directly.
// Frontend–Backend Flow
// Frontend calls a mutation/query.
// Backend receives the request, ctx provides access to:
// Database (ctx.db)
// Authentication (if needed, ctx.auth)
// Backend runs the handler, performs the operation (insert, fetch, delete).
// Backend returns the result to frontend.
