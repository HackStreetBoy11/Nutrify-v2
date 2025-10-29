"use client";
// STEP 1️⃣: Marks this file as a client component (runs in the browser)

import { useState, useMemo } from "react";
// STEP 2️⃣: Import hooks for local state (useState) and memoized computation (useMemo)

import { motion } from "framer-motion";
// STEP 3️⃣: Import motion for animation

import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
// STEP 4️⃣: Clerk components for authentication
// useUser() gives the current logged-in user info
// SignedIn/SignedOut handle conditional rendering based on auth state

import { useQuery, useMutation } from "convex/react";
// STEP 5️⃣: Hooks to connect frontend with Convex backend
// useQuery → fetch data
// useMutation → perform changes (insert, delete, etc.)

import { Trash2 } from "lucide-react";
// STEP 6️⃣: Import trash icon

import { api } from "../../../convex/_generated/api";
// STEP 7️⃣: Convex auto-generated API client used to call queries and mutations

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
// STEP 8️⃣: Import recharts components for visualization

import { Id } from "../../../convex/_generated/dataModel";
// STEP 9️⃣: Convex Id type (used for typed DB document references)


const COLORS = ["#22c55e", "#86efac", "#bbf7d0", "#166534"];
// STEP 🔟: Pie chart colors


// ✅ Local TypeScript type for tracked food entry
type TrackedFood = {
    _id: string;
    userId: string;
    name: string;
    quantity: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    date: string;
};

// STEP 1️⃣1️⃣: Defines structure of tracked food data

export default function TrackPageDemo() {
    // STEP 1️⃣2️⃣: Functional component starts here

    const { user } = useUser();
    // STEP 1️⃣3️⃣: Get current logged-in user from Clerk

    const deleteFoodMutation = useMutation(api.trackedFood.deleteFood);
    // STEP 1️⃣4️⃣: Prepare a Convex mutation function to delete food entry

    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    // STEP 1️⃣5️⃣: Manage selectedDate (default → today in YYYY-MM-DD)

    const convexUser = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id || "",
    });
    // STEP 1️⃣6️⃣: Fetch the Convex user document using Clerk ID
    // While user is loading, this might return undefined temporarily

    const trackedFoods = useQuery(
        api.trackedFood.getTrackedFoods,
        convexUser?._id ? { userId: convexUser._id } : "skip"
    ) as TrackedFood[] | null;
    // STEP 1️⃣7️⃣: Once convexUser is loaded, fetch their tracked foods
    // Passing "skip" prevents premature query execution before user is known

    const foodsForDate = useMemo(() => {
        if (!trackedFoods) return [];
        return trackedFoods.filter((f) => f.date === selectedDate);
    }, [trackedFoods, selectedDate]);
    // STEP 1️⃣8️⃣: Filter foods for the selected date
    // Memoized to avoid recalculating unless dependencies change

    const totals = foodsForDate.reduce(
        (acc, f) => ({
            calories: acc.calories + (f.calories || 0),
            protein: acc.protein + (f.protein || 0),
            carbs: acc.carbs + (f.carbs || 0),
            fats: acc.fats + (f.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }

//      example   [
//   { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },
//   { name: "Eggs", calories: 78, protein: 6, carbs: 0.6, fats: 5 },
// ];

        
    );
    // STEP 1️⃣9️⃣: Aggregate totals (sum of nutrients)

    const chartData = [
        { name: "Calories", value: totals.calories },
        { name: "Protein", value: totals.protein },
        { name: "Carbs", value: totals.carbs },
        { name: "Fats", value: totals.fats },
    ];
    const pieData = [
        { name: "Protein", value: totals.protein },
        { name: "Carbs", value: totals.carbs },
        { name: "Fats", value: totals.fats },
    ];
    // STEP 2️⃣0️⃣: Prepare chart data for visual representation


    return (
        <>
            {/* STEP 2️⃣1️⃣: Renders only when user is signed in */}
            <SignedIn>
                <div className="min-h-screen mt-12 px-6 py-8 bg-gradient-to-b from-green-50 to-white">
                    {/* STEP 2️⃣2️⃣: Page layout wrapper with background */}

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-extrabold mb-6 text-center text-green-700"
                    >
                        🌿 Nutrify Tracker
                    </motion.h1>
                    {/* STEP 2️⃣3️⃣: Animated title */}

                    {/* STEP 2️⃣4️⃣: Date Picker */}
                    <div className="flex justify-center mb-6">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-green-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>

                    {/* STEP 2️⃣5️⃣: Summary Stat Cards */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                    >
                        <div className="p-4 rounded-xl shadow-md bg-green-100 text-green-800">
                            <h3 className="text-sm font-medium">Calories</h3>
                            <p className="text-2xl font-bold">{totals.calories.toFixed(2)}</p>
                        </div>
                        <div className="p-4 rounded-xl shadow-md bg-lime-100 text-lime-800">
                            <h3 className="text-sm font-medium">Protein</h3>
                            <p className="text-2xl font-bold">{totals.protein.toFixed(2)}g</p>
                        </div>
                        <div className="p-4 rounded-xl shadow-md bg-emerald-100 text-emerald-800">
                            <h3 className="text-sm font-medium">Carbs</h3>
                            <p className="text-2xl font-bold">{totals.carbs.toFixed(2)}g</p>
                        </div>
                        <div className="p-4 rounded-xl shadow-md bg-teal-100 text-teal-800">
                            <h3 className="text-sm font-medium">Fats</h3>
                            <p className="text-2xl font-bold">{totals.fats.toFixed(2)}g</p>
                        </div>
                    </motion.div>

                    {/* STEP 2️⃣6️⃣: Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Bar Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-lg shadow-lg border border-green-100"
                        >
                            <h2 className="font-semibold mb-4 text-green-700">Daily Nutrient Summary</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Pie Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-lg shadow-lg border border-green-100"
                        >
                            <h2 className="font-semibold mb-4 text-green-700">Macro Distribution</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${Number(value || 0).toFixed(2)}`}
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={index} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => Number(value || 0).toFixed(2)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* STEP 2️⃣7️⃣: Food Table */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white p-6 rounded-lg shadow-lg border border-green-100"
                        >
                            <h2 className="font-semibold mb-4 text-green-700">Food Log</h2>
                            <div className="overflow-x-auto">
                                <table className="table-auto w-full border border-green-200 border-collapse min-w-[500px]">
                                    <thead className="bg-green-100">
                                        <tr>
                                            <th className="p-3 border border-green-200">Food</th>
                                            <th className="p-3 border border-green-200">Calories</th>
                                            <th className="p-3 border border-green-200">Protein</th>
                                            <th className="p-3 border border-green-200">Carbs</th>
                                            <th className="p-3 border border-green-200">Fats</th>
                                            <th className="p-3 border border-green-200">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {foodsForDate.map((f) => (
                                            <tr key={f._id} className="hover:bg-green-50 transition-colors duration-200">
                                                <td className="p-3 border border-green-200">{f.name}</td>
                                                <td className="p-3 border border-green-200">{Number(f.calories || 0).toFixed(2)}</td>
                                                <td className="p-3 border border-green-200">{Number(f.protein || 0).toFixed(2)}</td>
                                                <td className="p-3 border border-green-200">{Number(f.carbs || 0).toFixed(2)}</td>
                                                <td className="p-3 border border-green-200">{Number(f.fats || 0).toFixed(2)}</td>
                                                <td className="p-3 border border-green-200">
                                                    <button
                                                        onClick={async () => {
                                                            // STEP 2️⃣8️⃣: Delete button → triggers Convex mutation
                                                            await deleteFoodMutation({ foodId: f._id as Id<"trackedFood"> });
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </SignedIn>

            {/* STEP 2️⃣9️⃣: If user not signed in → Redirect */}
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
}
