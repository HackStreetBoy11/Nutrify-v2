"use client";

import { useQuery } from "convex/react";

import Notifications from "@/components/Notifications";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Apple, Search, Activity, User, Bell } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";


const Navbar = () => {
    const { user, isSignedIn } = useUser();
    // ✅ Fetch notifications from Convex
    const [showNotifications, setShowNotifications] = useState(false);


    const convexUser = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id || "",
    });

    if (user && convexUser === undefined) return null;

    return (
        <header
            className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100/80"
        >
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    {/* Left Section */}
                    <div className="flex items-center gap-8">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
                        >
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Apple className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-lg font-bold">Nutrify</h1>
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4 relative">
                        {isSignedIn && (
                            <>
                                <Link href="/dashboard" className="btn btn-sm gap-2">
                                    <Search size={20} />
                                </Link>

                                <Link href="/track" className="btn btn-sm gap-2">
                                    <Activity size={20} />
                                </Link>

                                <Link href="/chat" className="btn btn-sm gap-2">
                                    <User size={20} />
                                </Link>

                                {convexUser && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowNotifications((prev) => !prev)}
                                            className="relative p-2 rounded-full"
                                        >
                                            <Bell size={20} />

                                        </button>
                                        {
                                            showNotifications && (
                                                <div className="absolute right-0 mt-2 w-72 z-50">
                                                    {/* <Notifications convexUser={convexUser} /> */}
                                                    <Notifications />

                                                </div>
                                            )
                                        }
                                    </div>
                                )}


                                {/* Clerk User Button */}
                                <UserButton afterSignOutUrl="/" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
