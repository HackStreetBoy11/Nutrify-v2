import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
/*
    defineSchema -> used to define the entire structure of your Convex  database (like a blueprint)
    defineTable -> Used to define each collection/table inside that schema (like "Users" or "trackedFood").
    v -> A helper used to define and validate data types for each field (like v.string(), v.number(),etc.).
 */


export default defineSchema({ // jab export default use karte hai toh ham kahi bhi isse use kar sakte hai apne project by importing it
    users: defineTable({
        clerkId: v.string(),// The unique userId provided by clerk, your authentication provider. Used to connect convex user with clerk accounts.
        fullName: v.string(),// the user's name
        email: v.string(),// user's email
        profilePic: v.optional(v.string()),
    }).index("by_clerk_id", ["clerkId"]),
    //Here you define a table named users that stores user data
    // {
    // clerkId: "user_12345",
    // fullName: "Varun Sammal",
    // email: "varun@gmail.com"
    // }
    // how indexing works⚡ 4️⃣ How You Use It Later

    // Let’s say you want to find a user by their clerkId.
    // You can now use this index in a query like this 👇

    // const user = await db
    //   .query("users")
    //   .withIndex("by_clerk_id", q => q.eq("clerkId", "clerk_02"))
    //   .unique();


    // Here’s how it works step by step:
    // .withIndex("by_clerk_id") → Tells Convex to use that indexed field.
    // q.eq("clerkId", "clerk_02") → Says, “Find the record where clerkId equals this value.”
    // .unique() → Because each Clerk ID is unique per user.
    // ✅ Result: Convex instantly finds and returns that user.



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
    //     {
    // userId: "1ae3f7b9",
    // name: "Boiled Egg",
    // calories: 78,
    // protein: 6,
    // carbs: 0.6,
    // fat: 5.3,
    // date: "2025-10-23",
    // quantity: 2
    // }

    // 🆕 Add this table
    userGoals: defineTable({
        userId: v.id("users"),
        date: v.string(),
        calories: v.number(),
        protein: v.number(),
        carbs: v.number(),
        fats: v.number(),
    }).index("by_user", ["userId"]),

    // additional feature no in working yet....
    notifications: defineTable({
        userId: v.id("users"),
        type: v.union(
            v.literal("protein"),
            v.literal("calories"),
            v.literal("fats"),
            v.literal("carbs")
        ),
        message: v.string(),
        isRead: v.optional(v.boolean()),
        sentAt: v.optional(v.number()),
    }).index("by_user", ["userId"]),

});
