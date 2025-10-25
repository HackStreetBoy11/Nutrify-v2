"use client";
// client side component

import { useState, useMemo } from "react";
// useState manages local component state
// useMemo memorizes computed vales to avoid unnecessary recalculations on every render (used for foodsForDate)
import { motion } from "framer-motion";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
// SignedIn and SignedOut are Conditional components reder children only when user is signed in/out
// RedirectToSignIn is a helper that redirects unauthenticated users to clerk's sign-in page
// useUser() is a hook that returns the current authenticated user object and auth status (userIsSignnedIn, user etc)
// user object typically contains id, email, firstName, lastName, etc.
import { useQuery, useMutation } from "convex/react";
// useQuery is a hook to fetch data from convex backend
// useMutation is a hook to call mutation functions defined in convex backend
import { Trash2 } from "lucide-react";
// Icon component Trash2 used as delete button icon
import { api } from "../../../convex/_generated/api";
// api is the genenrated client-side API for interacting with convex backend
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
// charting primitives from recharts. Used to render bar chart and pie chart for nutrient visualization
import { Id } from "../../../convex/_generated/dataModel";
// Id generic type for convex document IDs. e.g. Id<"trackedFood"> ensures the _id value has the right type shape. Used for type-safety
// when calling mutations that require document IDs.

const COLORS = ["#22c55e", "#86efac", "#bbf7d0", "#166534"];
// colors used for the pie chart slices. Using an array lets you map them to cell components easily.

// ✅ Type for tracked food entry
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
// A local typescript type describing a tracked food document
// _id is string here (convex Id<> typically has a specific runtime structure,casting to string is okay for rendering keys.)
// nutritional fields are optional (?) because some logged items might lack detiled nutrition.

export default function TrackPageDemo() {
    const { user } = useUser();
    // destructures the user object from clerk's useUser hook
    // user may be undefined while clerk finishes loading the auth  state , so check for its existance  before using fileds like 
    // user.id
    const deleteFoodMutation = useMutation(api.trackedFood.deleteFood);
    // creates a mutation function to delete tracked food entries by calling the deleteFood mutation defined in convex backend
    // deleteFoodMutation will bbe a funciton you can await to call the server-side mutation. It's typed according to api.trackedFood.deleteFood
    //arguements.
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    // Local seletedDate state initialized to today in yyyy-mm-dd format.
    // toISOString().split("T")[0] yields 2025-10-22 style string: good for HTML <input type="date"> value
    // setSelectedDate update the date when user changes the date picker input
    const convexUser = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id || "",
    });
    // calls api.users.getUserByClerkId with{clerkId} 
    // important runtime detail: user might be undefined initially ; the code passes user?.id || "". if the convex query expects a non-empty
    /*  clerkId, this may return no user or an error depending on how the server handler hanldes empty string. A common pattern is to pass a \
    sentinel (e.g. "skip" or null )to useQuery to avoid running untill user exists -- check your convex query's expectations
    convexUser will be undefined while the query is loading, or the user object when available. 
    */

    const trackedFoods = useQuery(
        api.trackedFood.getTrackedFoods,
        convexUser?._id ? { userId: convexUser._id } : "skip"
    ) as TrackedFood[] | null;
    /*
        calls getTrackedFoods with {userId} when convexUser._id is truthy; otherwise passes "skip"
        "skip " is used here as a sentinel to prevent executing the query until we have a valid userId
        typecast to TrackedFood[] | null to help typescript for later uasge. At runtime trackedFoods may be undefined or null while 
        loading, your casting assumes null for non-run , but be careful about runtime undefined,
        getTrackedFoods likely returns a list of documents for that user, live-updated. convex auto pushes updates to subscribeers
    */

    const foodsForDate = useMemo(() => {
        if (!trackedFoods) return [];
        return trackedFoods.filter((f) => f.date === selectedDate);
    }, [trackedFoods, selectedDate]);
    /*
        useMemo memorizes the filtered list (foodsForDate) so it only re-computes when trackedFoods or selectedDate changes.
        if trackedFoods is falsy(e.g. null /undefined), reuturns an empty array to avoid errors.
        filtering uses strict equality on f.date and seletedDate, Make sure the date saved in DB uses the exact same yyyy-mm-dd 
        string format to match properly.
    */
    const totals = foodsForDate.reduce(
        (acc, f) => ({
            calories: acc.calories + (f.calories || 0),
            protein: acc.protein + (f.protein || 0),
            carbs: acc.carbs + (f.carbs || 0),
            fats: acc.fats + (f.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    /*
        Reduces foodsForDate into an aggregated totals object.
        uses (f.calores || 0) to safely treat missing values as 0. if you expect 0 explicit values and want to treat null differently,
        consider typeof f.calories === "number" ? f.calories : 0
        totals will be {caloreis: number, protein:umber ,carbs:number, fats:number}
    */
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
    /*
        chartData is used for Barchart (inclues calories)
        pieData is used for PieChart (macros only).
        if all vales are zero , charts will be empty/flat; you might want to show a placeholder message in that case.
    */
    return (
        /* The Component returns a fragment with two conditional parts: SignedIn and SigedOut
         The outer div sets layout and background using Tailwind classes. min-h-screen ensueres full-height background 
        */
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
                    {/* 
                        Animated header using framer-motion.
                        initial sets start state, animate sets ends state, and transition configures timing. Nice UX polish.
                    */}

                    {/* Date Picker */}
                    <div className="flex justify-center mb-6">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-green-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>
                    {/* 
                        Simple date input center-aligned
                        value bound to selectedDate; onchange updates state
                        good: using yyyy-mm-dd string matches <input type=date> value format
                    */}

                    {/* Stat Cards */}
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
                    {/* 
                        Grid of four summary cards.
                        totals.*.toFixed(2) renders numbers with two decimal (e.g. 123.00). if you want intergers for calories, 
                        you might use Math.round or toFixed(0) -calories often shown as intergers
                        visual styling via Tailwind colors.
                    */}
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                        {/* 
                            ResponsiveContainer makes the chart responsive
                            Bar uses dataKey="value" must match object in chartData
                            radius rounds the top corner of bars
                            if values are large, consider providing domain prop for YAxis to control scale
                        */}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-lg shadow-lg border border-green-100"
                        >
                            <h2 className="font-semibold mb-4 text-green-700">Macro Distribution</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                {/* PieChart */}
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
                                {/* 
                                Pie uses pieData.cell  components map the COLORS array to slices
                                label shows slice names and values with 2 decimals. For small values, labels may overlap; Consider 
                                a legend or tooltip-only display if values are tiny
                                 */}
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Food Table */}
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
                                            <th className="p-3 border border-green-200">Action</th>
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
                    {/* 
                        Table header defines colums
                        foodsForDate.map iterates over filterd food enteries for the selected day. Each row uses f._id as key (good)
                        Nutrient values are printed with Number(...).toFixed(2) for consistent 2-decimal display
                        Delete button calls deleteFoodMutation with foodId when clicked. f._id is cast to Id<"trackedFood"> for type-safety
                        visual styling includes hover effects for rows and buttons
                    */}
                </div>
            </SignedIn>

            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
}
