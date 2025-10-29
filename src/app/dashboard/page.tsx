"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ------------------------------------------------------------
// 🧠 Step 0 — File Initialization
// This is a Next.js client component. 
// All imports are loaded first.
// Then DashboardPage() function is defined.
// ------------------------------------------------------------

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function DashboardPage() {

  // 🧩 Step 1 — Authentication Hook
  // useUser() runs immediately when the component mounts.
  // It returns the Clerk user object (if logged in).
  const { user } = useUser();

  // 🧩 Step 2 — Setup Convex Mutations
  // These functions connect your frontend → Convex backend APIs.
  const createUser = useMutation(api.users.syncUser);      // writes to DB
  const addTrackedFood = useMutation(api.trackedFood.addTrackedFood); // writes food tracking entry

  // 🧩 Step 3 — Local React States
  // These are initialized *before any effect runs*.
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [food, setFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [tipIndex, setTipIndex] = useState(0);

  // 🧩 Step 4 — Convex Query to Fetch DB User
  // This runs *automatically* after component mount.
  // It depends on user?.id (from Clerk).
  // Initially user may be undefined → so Convex query might return null.
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // 🧠 Order:
  // (1) useUser() → gets Clerk user.
  // (2) useQuery() runs with clerkId = "" (first render)
  // (3) After Clerk loads user info → React re-renders
  // (4) useQuery() runs again with actual clerkId.
  // (So user from Clerk comes first, then convexUser fetched second)

  // 🧩 Step 5 — Motivational Tips
  const tips = [
    "🥗 Eat fresh, live fresh — stay consistent with your meals.",
    "💧 Hydrate yourself! At least 2 liters of water every day.",
    "🌈 Add colors to your plate — fruits and veggies matter!",
    "🔥 Small progress daily leads to big results over time.",
  ];

  // 🧩 Step 6 — useEffect to Sync Clerk User → Convex DB
  useEffect(() => {
    // Runs only when 'user' or 'createUser' changes.
    // That means it runs once right after Clerk user loads.
    if (user) {
      createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`,
        profilePic: user.imageUrl,
      });
    }
  }, [user, createUser]);
  // 🧠 So the sequence is:
  // - user loads from Clerk ✅
  // - then createUser() sends data to Convex ✅
  // - then Convex stores/updates user info ✅
  // - after that, convexUser query automatically reflects updated user info ✅

  // 🧩 Step 7 — useEffect for Rotating Tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 4000);

    // Cleanup when leaving page
    return () => clearInterval(interval);
  }, []);
  // 🧠 This runs *once on mount* and continues updating tipIndex every 4s.

  // 🧩 Step 8 — Search Food Function (USDA API)
  const searchFood = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;

    // Runs on every keystroke in search input
    if (query.length > 2) {
      try {
        const res = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&api_key=eaXR8kjXm6roxkfIL5XCSLgtbvc1tdEa4SH9NNWT`
        );
        const data = await res.json();

        if (data.foods) {
          const mapped = data.foods.map((item: any) => {
            const nutrients: Record<string, number> = {};
            item.foodNutrients.forEach((n: any) => {
              nutrients[n.nutrientName] = n.value;
            });
            return {
              name: item.description,
              calories: nutrients["Energy"] || 0,
              protein: nutrients["Protein"] || 0,
              carbs: nutrients["Carbohydrate, by difference"] || 0,
              fats: nutrients["Total lipid (fat)"] || 0,
            };
          });
          setFoodItems(mapped);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setFoodItems([]);
    }
  };

  // 🧩 Step 9 — Scaled Nutrition Helper
  const scaled = (val: number) => ((val || 0) * quantity) / 100;
  // This is a pure function; no side effects.

  // 🧩 Step 10 — Add Selected Food to Convex DB
  const addToTrack = async () => {
    // Validation checks first
    if (!food || !user) {
      toast.error("Please select a food item first!");
      return;
    }
    if (!convexUser?._id) {
      toast.error("User not synced yet. Try again in a moment.");
      return;
    }

    const toastId = toast.loading("Adding food to your daily track...");

    try {
      // Main DB write operation to Convex
      await addTrackedFood({
        userId: convexUser._id,
        name: food.name,
        quantity,
        calories: scaled(food.calories),
        protein: scaled(food.protein),
        carbs: scaled(food.carbs),
        fats: scaled(food.fats),
        date: new Date().toISOString().split("T")[0],
      });

      toast.success(`"${food.name}" added successfully!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add food. Please try again.", { id: toastId });
    }
  };

  // 🧠 Step order so far:
  // 1️⃣ Clerk user loads
  // 2️⃣ useEffect syncs user to Convex
  // 3️⃣ Convex query fetches convexUser
  // 4️⃣ User searches food (USDA)
  // 5️⃣ Selects food, scales macros
  // 6️⃣ Clicks “Add” → Convex mutation saves data
  // 7️⃣ Toasts show feedback

  // 🧩 Step 11 — JSX Render (UI Render Phase)
  // React now renders UI using all states above.
  // This re-renders multiple times as states change (user, convexUser, food, etc.)
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-lime-100 flex flex-col items-center justify-center p-8">
      {/* 🖼️ Background blur image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 blur-[1px]" />

      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-white/30 backdrop-blur-md" />

      {/* 🧩 Step 12 — Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center mb-10"
      >
        <h1 className="text-5xl font-extrabold text-green-700 tracking-tight drop-shadow-md">
          🌿 Nutrify Search
        </h1>
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-gray-700 italic text-lg mt-3"
        >
          {tips[tipIndex]}
        </motion.p>
      </motion.div>

      {/* 🧩 Step 13 — Search Box & Results */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8"
      >
        <h2 className="text-3xl font-semibold text-center text-green-700 mb-6">
          Track Your Daily Food 🍱
        </h2>

        {/* Search input triggers searchFood() */}
        <Input
          type="search"
          placeholder="Search for food (e.g., Apple, Rice, Chicken)..."
          onChange={searchFood}
          className="w-full mb-4 bg-white/70 border border-green-200 focus:ring-2 focus:ring-green-400"
        />

        {/* Display search results */}
        {foodItems.length > 0 && (
          <div className="mt-2 bg-white/70 rounded-xl shadow-inner max-h-80 overflow-y-auto border border-green-100">
            {foodItems.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  setFood(item);
                  setFoodItems([]);
                }}
                className="px-4 py-3 cursor-pointer hover:bg-green-50 border-b last:border-none transition"
              >
                <p className="font-medium text-green-700">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.calories} kcal · {item.protein}g protein
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 🧩 Step 14 — Selected Food Display */}
        {food && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/60 rounded-2xl p-6 shadow-lg border border-green-100"
          >
            <h3 className="text-xl font-bold mb-4 text-green-800 text-center">
              {food.name}
            </h3>

            {/* Quantity input */}
            <div className="flex justify-center items-center gap-3 mb-5">
              <label className="text-sm font-medium text-gray-700">
                Quantity (g):
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                className="w-24 text-center border-green-200 bg-white/80"
              />
            </div>

            {/* Nutrition stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <StatCard label="Calories" value={scaled(food.calories).toFixed(1)} />
              <StatCard label="Protein" value={`${scaled(food.protein).toFixed(1)}g`} />
              <StatCard label="Carbs" value={`${scaled(food.carbs).toFixed(1)}g`} />
              <StatCard label="Fats" value={`${scaled(food.fats).toFixed(1)}g`} />
            </div>

            {/* Add button triggers addToTrack() */}
            <Button
              onClick={addToTrack}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md"
            >
              Add to My Daily Track
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ------------------------------------------------------------
// 🧩 Step 15 — Reusable StatCard Component
// Used for displaying each nutrition metric.
// ------------------------------------------------------------
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-green-100"
    >
      <p className="text-green-700 font-bold text-lg">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </motion.div>
  );
}
