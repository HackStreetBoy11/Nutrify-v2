"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { LogOut, Apple, User } from "lucide-react";

const Navbar = () => {
    const { user, isSignedIn } = useUser();

    return (
        <header
            className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
        >
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    {/* Left Section */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Apple className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-lg font-bold">Nutrify</h1>
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {isSignedIn && (
                            <>
                                <Link href="/dashboard" className="btn btn-sm gap-2">
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">Search</span>
                                </Link>


                                <Link href="/track" className="btn btn-sm gap-2">
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">Track</span>
                                </Link>
                                {/* Clerk handles logout inside the UserButton */}
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
