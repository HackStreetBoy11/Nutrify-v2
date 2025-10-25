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
    return await ctx.db.insert("trackedFood", args);
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
    await ctx.db.delete( foodId);
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
