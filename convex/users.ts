// Important mutation is for writing and query is for reading
    // and ctx is context object which is like a translator betwenn frontend and convex backend
    // So yes ✅ — ctx is like the translator/bridge that connects frontend requests to backend logic and database securely.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
/*
    v-> convex value validators , you define types of arguments you queries or mutation accept (like string, number , optional values, etc)
    mutation -> Used to define write operation (insert,update,delete) to your convex database.(Like PUT,POST,DELETE)
    query -> Used to define read operation (fetching data) from the database. (like GET)
*/

// Mutation to sync a user
export const syncUser = mutation({
    args: { // parameteres defined
        email: v.string(),
        fullName: v.string(),
        profilePic: v.optional(v.string()),
        clerkId: v.string(),
    },
    handler: async (ctx, args) => { // main function
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .first();

        if (existingUser) return existingUser;

        return await ctx.db.insert("users", {
            email: args.email,
            fullName: args.fullName,
            profilePic: args.profilePic || undefined,
            clerkId: args.clerkId,
        });
    },
});
/*
    1. export const syncuser = mutation({....})  => defines a backend mutation that can be called from the frontend
        "Sync" here means: If a user exists, return it; if not, create a new user.
    2. args: {...}
       Define the input arguments expected from the frontend    
       v.string() -> required string
       v.optonal(v.string()) -> optional string (can be undefined)
    3. handler: async(ctx,args)=> {...}
        The function that executes when the mutation is called.
        ctx -> context object giving you access to the databases (ctx.db) and auth (ctx.auth)
        args -> the arguments passed from frontend
    4. ctx.db.query("users")
        Query the users table in convex
    5. .filter((q) => q.eq(q.field("clerkId"),args.clerkId))
        filter users where clerkId matches the given argument.
        q.field("clerkId") -> refers to the database column clerkId.
        q.eq() -> equals operator.
    6. .first()
        return first matched user (or undefined if none found).
    7. if (existingUser)return existingUser;
    8. ctx.db.insert("users",{...})
        insert a new user into users table if it doesn't exist.

    ----------HOW DATA is send from Ui to backend
        import { useMutation } from "convex/react";
        import { syncUser } from "../convex/_generated/mutations";

        const mutation = useMutation(syncUser);

        await mutation({ 
        email: "user@example.com", 
        fullName: "John Doe", 
        profilePic: "http://example.com/pic.jpg", 
        clerkId: "clerk_123"
        });

*/


// Query to get all users // means read operation
export const getUsers = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("User is not authenticated");

        const users = await ctx.db.query("users").collect();
        return users;
    },
});
/*
    1. export const getUsers = query({...})
        backend query that fetches data from database
    2.  ctx.auth.getUserIdentity()
        Gets the currently authenticated user(via clerk or any other auth provider).
    3. if(!identity) throw new error(...)
        Protects your query --- only authenticated users can fetch all users.
    4. ctx.db.query("users").collect()
        Fetches all rows in the users table

    ------ how used in fronted------
    import { useQuery } from "convex/react";
    import { getUsers } from "../convex/_generated/queries";
    const users = useQuery(getUsers);
    // users will now contain all users in your database, or undefined while loading.

*/

// Query to get a user by Clerk ID
export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();
        
        return user;
    },
    /*  
        1. args: { clerkId: v.string()}
            Expects clerkId from frontend
        2.  ctx.db.query("users").withIndex("by_clerk_id",.....)
            Efficiently fetch a user using database index by_clerk_id.
            Indexes imporve query speed for lookups by a specific column.
        3. .frist() -> get first matching row.

        import { useQuery } from "convex/react";
        import { getUserByClerkId } from "../convex/_generated/queries";
        const user = useQuery(getUserByClerkId, { clerkId: "clerk_123" });

        ---- Returns the user object with that clerk ID.
     */

});


// ✅ Summary of flow

// Frontend calls a mutation or query using useMutation or useQuery.

// Backend (Convex) handles it:

// Validates input with v.string() / v.optional().

// Reads/writes to ctx.db (Convex DB).

// Can check authentication with ctx.auth.

// Data returns to frontend as JS objects.