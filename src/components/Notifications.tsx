"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function Notifications() {
    const { user, isSignedIn } = useUser();
    const convexUser = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id || "",
    });
    if (user && convexUser === undefined) return null;
    if (!convexUser) return null;

    const notifications = useQuery(api.notifications.getByUser, {
        userId: convexUser._id,
    });

    const markAsRead = useMutation(api.notifications.markAsRead);

    if (notifications === undefined) {
        // convex query is still loading
        return null;
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mt-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <h3 className="font-semibold text-lg mb-2">Notifications</h3>

            {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No new notifications</p>
            ) : (
                notifications.map((n) => (
                    <div
                        key={n._id}
                        onClick={() => markAsRead({ notificationId: n._id })}
                        className="p-3 border-b border-gray-200 last:border-none cursor-pointer 
             bg-white hover:bg-gray-100 transition-colors duration-200"
                    >
                        <p>{n.message}</p>
                        <span className="text-xs text-gray-400">
                            {n.sentAt
                                ? new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : "—"}
                        </span>

                    </div>
                ))
            )}
        </div>
    );
}
