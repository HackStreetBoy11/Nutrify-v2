"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const createUser = useMutation(api.users.syncUser);
  const addTrackedFood = useMutation(api.trackedFood.addTrackedFood);

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [food, setFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [tipIndex, setTipIndex] = useState(0);

  const convexUser = useQuery(api.users.getUserByClerkId, {
  clerkId: user?.id || "",
});

  const tips = [
    "🥗 Eat fresh, live fresh — stay consistent with your meals.",
    "💧 Hydrate yourself! At least 2 liters of water every day.",
    "🌈 Add colors to your plate — fruits and veggies matter!",
    "🔥 Small progress daily leads to big results over time.",
  ];

  useEffect(() => {
    if (user) {
      createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`,
        profilePic: user.imageUrl,
      });
    }
  }, [user, createUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const searchFood = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
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

  const scaled = (val: number) => ((val || 0) * quantity) / 100;

 const addToTrack = async () => {
  if (!food || !user) {
    toast.error("Please select a food item first!");
    return;
  }

  if (!convexUser?._id) {
    toast.error(" User not synced yet. Try again in a moment.");
    return;
  }

  // show loading state
  const toastId = toast.loading("Adding food to your daily track...");

  try {
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

    // update loading toast → success
    toast.success(`"${food.name}" added successfully!`, { id: toastId });
  } catch (err) {
    console.error(err);
    toast.error("Failed to add food. Please try again.", { id: toastId });
  }
};

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-lime-100 flex flex-col items-center justify-center p-8">
      {/* Background Food Image Layer */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 blur-[1px]" />

      {/* Floating Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-white/30 backdrop-blur-md" />

      {/* Header */}
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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-gray-700 italic text-lg mt-3"
        >
          {tips[tipIndex]}
        </motion.p>
      </motion.div>

      {/* Glass Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8"
      >
        <h2 className="text-3xl font-semibold text-center text-green-700 mb-6">
          Track Your Daily Food 🍱
        </h2>

        {/* Search Input */}
        <Input
          type="search"
          placeholder="Search for food (e.g., Apple, Rice, Chicken)..."
          className="w-full mb-4 bg-white/70 border border-green-200 focus:ring-2 focus:ring-green-400"
          onChange={searchFood}
        />

        {/* Search Results */}
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

        {/* Selected Food Display */}
        {food && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/60 rounded-2xl p-6 shadow-lg border border-green-100"
          >
            <h3 className="text-xl font-bold mb-4 text-green-800 text-center">
              {food.name}
            </h3>

            <div className="flex justify-center items-center gap-3 mb-5">
              <label className="text-sm font-medium text-gray-700">
                Quantity (g):
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuantity(Number(e.target.value) || 0)
                }
                className="w-24 text-center border-green-200 bg-white/80"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <StatCard label="Calories" value={scaled(food.calories).toFixed(1)} />
              <StatCard label="Protein" value={`${scaled(food.protein).toFixed(1)}g`} />
              <StatCard label="Carbs" value={`${scaled(food.carbs).toFixed(1)}g`} />
              <StatCard label="Fats" value={`${scaled(food.fats).toFixed(1)}g`} />
            </div>

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

// Small Stat Card Component
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
