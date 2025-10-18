"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
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

const COLORS = ["#22c55e", "#86efac", "#bbf7d0", "#166534"];

export default function TrackPageDemo() {
    const { user } = useUser();
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    // ✅ Get Convex user
    const convexUser = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id || "",
    });

    // ✅ Get tracked foods for that user
    const trackedFoods = useQuery(api.trackedFood.getTrackedFoods, convexUser?._id ? { userId: convexUser._id } : "skip");

    // ✅ Filter foods by selected date
    const foodsForDate = useMemo(() => {
        if (!trackedFoods) return [];
        return trackedFoods.filter((f) => f.date === selectedDate);
    }, [trackedFoods, selectedDate]);

    // ✅ Calculate totals
    const totals = foodsForDate.reduce(
        (acc, f) => ({
            calories: acc.calories + (f.calories || 0),
            protein: acc.protein + (f.protein || 0),
            carbs: acc.carbs + (f.carbs || 0),
            fats: acc.fats + (f.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

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

    return (
        <>
            <SignedIn>
                <div className="min-h-screen mt-12 px-6 py-8 bg-gradient-to-b from-green-50 to-white">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-extrabold mb-6 text-center text-green-700"
                    >
                        🌿 Nutrify Tracker
                    </motion.h1>

                    {/* Date Picker */}
                    <div className="flex justify-center mb-6">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-green-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>

                    {/* Stat Cards */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                    >
                        <div className="p-4 rounded-xl shadow-md bg-green-100 text-green-800">
                            <h3 className="text-sm font-medium">Calories</h3>
                            <p className="text-2xl font-bold">{totals.calories}</p>
                            <p className="text-xs">Goal: 2000</p>
                        </div>
                        <div className="p-4 rounded-xl shadow-md bg-lime-100 text-lime-800">
                            <h3 className="text-sm font-medium">Protein</h3>
                            <p className="text-2xl font-bold">{totals.protein}g</p>
                            <p className="text-xs">Goal: 150g</p>
                        </div>
                        <div className="p-4 rounded-xl shadow-md bg-emerald-100 text-emerald-800">
                            <h3 className="text-sm font-medium">Carbs</h3>
                            <p className="text-2xl font-bold">{totals.carbs}g</p>
                            <p className="text-xs">Goal: 250g</p>
                        </div>
                        <div className="p-4 rounded-xl shadow-md bg-teal-100 text-teal-800">
                            <h3 className="text-sm font-medium">Fats</h3>
                            <p className="text-2xl font-bold">{totals.fats}g</p>
                            <p className="text-xs">Goal: 70g</p>
                        </div>
                    </motion.div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-lg shadow-lg border border-green-100"
                        >
                            <h2 className="font-semibold mb-4 text-green-700">
                                Daily Nutrient Summary
                            </h2>
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

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-lg shadow-lg border border-green-100"
                        >
                            <h2 className="font-semibold mb-4 text-green-700">
                                Macro Distribution
                            </h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        dataKey="value"
                                        label
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={index} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Food Table */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white p-6 rounded-lg shadow-lg border border-green-100"
                    >
                        <h2 className="font-semibold mb-4 text-green-700">Food Log</h2>
                        <table className="table-auto w-full border border-green-200 border-collapse">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="p-3 border border-green-200">Food</th>
                                    <th className="p-3 border border-green-200">Calories</th>
                                    <th className="p-3 border border-green-200">Protein</th>
                                    <th className="p-3 border border-green-200">Carbs</th>
                                    <th className="p-3 border border-green-200">Fats</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foodsForDate.map((f, i) => (
                                    <tr key={i} className="hover:bg-green-50 transition-colors duration-200">
                                        <td className="p-3 border border-green-200">{f.name}</td>
                                        <td className="p-3 border border-green-200">{f.calories}</td>
                                        <td className="p-3 border border-green-200">{f.protein}</td>
                                        <td className="p-3 border border-green-200">{f.carbs}</td>
                                        <td className="p-3 border border-green-200">{f.fats}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </SignedIn>

            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
}
