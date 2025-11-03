"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
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
import { Id } from "../../../convex/_generated/dataModel";

const COLORS = ["#22c55e", "#86efac", "#bbf7d0", "#166534"];

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

export default function TrackPageDemo() {
    const today = new Date().toISOString().split("T")[0];
    const { user } = useUser();

    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goal, setGoal] = useState({
        protein: "",
        carbs: "",
        fats: "",
        calories: "",
    });

    // ✅ Default Goal
    const GOAL = {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fats: 60,
    };

    // ✅ Active goal shown on the page
    const [activeGoal, setActiveGoal] = useState(GOAL);
    const deleteFoodMutation = useMutation(api.trackedFood.deleteFood);

    const [selectedDate, setSelectedDate] = useState(today);

    const convexUser = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id || "",
    });

    if (!convexUser?._id) {
        console.error("User not logged in");
        return;
    }


    const goalData = useQuery(
        api.userGoals.getGoalByDate,
        convexUser?._id
            ? { userId: convexUser._id, date: selectedDate }
            : "skip"
    );

    const saveGoal = useMutation(api.userGoals.setGoal);

    useEffect(() => {
        if (goalData) {
            setActiveGoal({
                calories: goalData.calories,
                protein: goalData.protein,
                carbs: goalData.carbs,
                fats: goalData.fats,
            });
        } else {
            setActiveGoal(GOAL); // fallback if no goal found for that date
        }
    }, [goalData, selectedDate]);


    const trackedFoods = useQuery(
        api.trackedFood.getTrackedFoods,
        convexUser?._id ? { userId: convexUser._id } : "skip"
    ) as TrackedFood[] | null;

    const foodsForDate = useMemo(() => {
        if (!trackedFoods) return [];
        return trackedFoods.filter((f) => f.date === selectedDate);
    }, [trackedFoods, selectedDate]);

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

    const getProgress = (current: number, target: number) =>
        target > 0 ? Math.min((current / target) * 100, 100) : 0;

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

                    {/* Date Picker + Goal Button */}
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-green-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />

                        {selectedDate === today ? (
                            <button
                                onClick={() => setShowGoalModal(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                            >
                                🎯 Set Goal
                            </button>
                        ) : (
                            <div className="mt-2 flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-medium px-4 py-2 rounded-lg shadow-sm">
                                ⚠️ You can only set goals for{" "}
                                <span className="font-semibold text-yellow-900">today</span>.
                            </div>
                        )}
                    </div>

                    {/* Summary Cards with Progress Bars */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                    >
                        {/* Calories */}
                        <div className="p-4 rounded-xl shadow-md bg-green-100 text-green-800">
                            <h3 className="text-sm font-medium">Calories</h3>
                            <p className="text-2xl font-bold">
                                {totals.calories.toFixed(0)} / {activeGoal.calories}
                            </p>
                            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${getProgress(totals.calories, activeGoal.calories)}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs mt-1">
                                {getProgress(totals.calories, activeGoal.calories).toFixed(1)}%
                            </p>
                        </div>

                        {/* Protein */}
                        <div className="p-4 rounded-xl shadow-md bg-lime-100 text-lime-800">
                            <h3 className="text-sm font-medium">Protein</h3>
                            <p className="text-2xl font-bold">
                                {totals.protein.toFixed(1)}g / {activeGoal.protein}g
                            </p>
                            <div className="w-full bg-lime-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-lime-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${getProgress(totals.protein, activeGoal.protein)}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs mt-1">
                                {getProgress(totals.protein, activeGoal.protein).toFixed(1)}%
                            </p>
                        </div>

                        {/* Carbs */}
                        <div className="p-4 rounded-xl shadow-md bg-emerald-100 text-emerald-800">
                            <h3 className="text-sm font-medium">Carbs</h3>
                            <p className="text-2xl font-bold">
                                {totals.carbs.toFixed(1)}g / {activeGoal.carbs}g
                            </p>
                            <div className="w-full bg-emerald-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${getProgress(totals.carbs, activeGoal.carbs)}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs mt-1">
                                {getProgress(totals.carbs, activeGoal.carbs).toFixed(1)}%
                            </p>
                        </div>

                        {/* Fats */}
                        <div className="p-4 rounded-xl shadow-md bg-teal-100 text-teal-800">
                            <h3 className="text-sm font-medium">Fats</h3>
                            <p className="text-2xl font-bold">
                                {totals.fats.toFixed(1)}g / {activeGoal.fats}g
                            </p>
                            <div className="w-full bg-teal-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${getProgress(totals.fats, activeGoal.fats)}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs mt-1">
                                {getProgress(totals.fats, activeGoal.fats).toFixed(1)}%
                            </p>
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
                                        label={({ name, value }) =>
                                            `${name}: ${Number(value || 0).toFixed(2)}`
                                        }
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={index} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) =>
                                            Number(value || 0).toFixed(2)
                                        }
                                    />
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
                                        <tr
                                            key={f._id}
                                            className="hover:bg-green-50 transition-colors duration-200"
                                        >
                                            <td className="p-3 border border-green-200">{f.name}</td>
                                            <td className="p-3 border border-green-200">
                                                {Number(f.calories || 0).toFixed(2)}
                                            </td>
                                            <td className="p-3 border border-green-200">
                                                {Number(f.protein || 0).toFixed(2)}
                                            </td>
                                            <td className="p-3 border border-green-200">
                                                {Number(f.carbs || 0).toFixed(2)}
                                            </td>
                                            <td className="p-3 border border-green-200">
                                                {Number(f.fats || 0).toFixed(2)}
                                            </td>
                                            <td className="p-3 border border-green-200 text-center">
                                                <button
                                                    onClick={async () =>
                                                        await deleteFoodMutation({
                                                            foodId: f._id as Id<"trackedFood">,
                                                        })
                                                    }
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

                    {/* Goal Modal */}
                    {showGoalModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
                            <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] md:w-[400px] relative">
                                <button
                                    onClick={() => setShowGoalModal(false)}
                                    className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
                                >
                                    ✖
                                </button>
                                <h2 className="text-xl font-bold text-green-700 mb-4 text-center">
                                    Set Your Daily Goal
                                </h2>

                                <div className="flex flex-col gap-3">
                                    <input
                                        type="number"
                                        placeholder="Calories (g)"
                                        className="border border-green-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                                        value={goal.calories}
                                        onChange={(e) =>
                                            setGoal({ ...goal, calories: e.target.value })
                                        }
                                    />
                                    <input
                                        type="number"
                                        placeholder="Protein (g)"
                                        className="border border-green-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                                        value={goal.protein}
                                        onChange={(e) =>
                                            setGoal({ ...goal, protein: e.target.value })
                                        }
                                    />
                                    <input
                                        type="number"
                                        placeholder="Carbs (g)"
                                        className="border border-green-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                                        value={goal.carbs}
                                        onChange={(e) =>
                                            setGoal({ ...goal, carbs: e.target.value })
                                        }
                                    />
                                    <input
                                        type="number"
                                        placeholder="Fats (g)"
                                        className="border border-green-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                                        value={goal.fats}
                                        onChange={(e) => setGoal({ ...goal, fats: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={async () => {
                                        const userGoal = {
                                            calories: Number(goal.calories) || GOAL.calories,
                                            protein: Number(goal.protein) || GOAL.protein,
                                            carbs: Number(goal.carbs) || GOAL.carbs,
                                            fats: Number(goal.fats) || GOAL.fats,
                                        };
                                        await saveGoal({
                                            userId: convexUser._id,
                                            date: today,
                                            ...userGoal,
                                        });

                                        setActiveGoal(userGoal); // update goal
                                        setGoal({ calories: "", protein: "", carbs: "", fats: "" }); // reset input
                                        setShowGoalModal(false); // close modal
                                    }}
                                    className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                                >
                                    ✅ Save Goal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </SignedIn>

            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
}
