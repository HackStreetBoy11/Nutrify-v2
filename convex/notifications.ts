import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notificationId, { isRead: true });
    },
});

export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        // Only return unread notifications
        return notifications.filter((n) => !n.isRead);
    },
});
