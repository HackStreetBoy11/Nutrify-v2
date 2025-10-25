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
  const { user } = useUser(); // logged-in Clerk user info
  const createUser = useMutation(api.users.syncUser); // A convex mutation that syncs clerk user to convex DB 
  const addTrackedFood = useMutation(api.trackedFood.addTrackedFood); // A convex mutation that add a food tracking entry
//  so these connect your frontend to convex backend apis

  // state variables 
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);// array of food items from search or stores list of searched food
  const [food, setFood] = useState<FoodItem | null>(null); // the currently selected food item
  const [quantity, setQuantity] = useState(100); // Quantity in grams(used to scale nutrition info)
  const [tipIndex, setTipIndex] = useState(0); // which motivational tip is shown (changes every 4 second)

  // fetch convex user 
  const convexUser = useQuery(api.users.getUserByClerkId, {
  clerkId: user?.id || "",
});
// This runs a convex query to fetch your convex database user using clerk's  user.id.
// it ensueres that your frontedn and backend user accounts are in sync

// motivational tips to show 
  const tips = [
    "🥗 Eat fresh, live fresh — stay consistent with your meals.",
    "💧 Hydrate yourself! At least 2 liters of water every day.",
    "🌈 Add colors to your plate — fruits and veggies matter!",
    "🔥 Small progress daily leads to big results over time.",
  ];
  // simple rotating motivational tips shown on the search header.

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

  // when the user object is available(after login), it triggers createUser() -> sends user info to convex.
  // if the user doesn't exist in convex DB, it creates a new recored.
  // this runs once on login or when user data updates.

  // Tip totation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length); // chnages the state
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  // every 4 seconds,it changes the motivational tip.
  // when component unmounts, it clears the interval to avoid memory leaks.


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

  // This searches the USDA food database API
  // waits until the user types >= 3 letter
  // fetches results.
  // extrats calorires, protein, carbs,fats from  nutrient data.
  // saves results to foodItems state.

  const scaled = (val: number) => ((val || 0) * quantity) / 100;
  // since USDA data is based on 100g serving, this function scales the nutrition values based on user-entered quantity.

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
    await addTrackedFood({ // this add to convex dB
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
  // This adds the selected food to your convex DB
  //1 . Checks if food and user are available
  //2. shows a loading toast notification
  //3. calls the addTrackedFood mutation to save the food entry
  //4. updates the toast to success or error based on the result
};


  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-lime-100 flex flex-col items-center justify-center p-8">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 blur-[1px]" />
        {/*  adds blurred food image + glowing overlay for depth. */}
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
    {/*  animaged heading and motivational tip */}

      {/* Glass Container */}
      {/*  A glassmorphism-style white box that holds your search , result and seleted food */}
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
        {/* input box calls searchFood() on every change.
          Displays a dropdown of matching foods.
          clicking an item sets food and hides results.
        */}

        {/* Search Results */}
        {/*  once the food is selected then the mapped food(foodItems ) nutritent will be displayed */}
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
        {/* once food is seleted : :- quantity input lets you scale macros
        :- shows stats (calories, protein, carbs, fats) based on quantity using <StatCard/>
        :- A " Add to my daily Track" button calls addToTrack() to save the entry to convex DB.
        */}
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
// a simpple reusable component for displaying each nutrition stat.
// has a hover animation and nice glass effect.
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


// summary of searchpage
//1 : clerk logs in user -> useUser() gives user data
//2 : useEffect() syncs user to convex DB
//3: user Searches food -> API returns results
//4 : User sslects food -> can view nutrition and change quantity
// 5: User clicks "Add to my daily track" -> food data saved in convex
//6 : Motivational tips rotate automatically
// 7: Beautiful UI and animations powered by Tailwind+ framer motion

// What is useEffect ?
// useEffect is a React hook that lets you perform side effects in function components. things that happen outside the component's 
// main reindering logic

// useEffect Lifecycle Phases:
// React's useEffect runs during specifc times in the component's lifecycle:
// Phase   ----------	What happens
// Mount	 -----------When the component is first inserted into the DOM, the effect runs.
// Update	 -----------When dependencies (in the dependency array) change, the effect re-runs.
// Unmount	----------When the component is removed from the DOM, the cleanup function runs.

// 3. Your Specific Example — With Empty Dependency Array []
// The empty array [] means the effect runs only once —
// right after the component mounts.
// It will not run again unless the component is destroyed and re-mounted.
// So here’s the lifecycle step-by-step:

// Phase 1 — Mount (component first appears)
// When DashboardPage is rendered for the first time:
// const interval = setInterval(() => {
//   setTipIndex((i) => (i + 1) % tips.length);
// }, 4000);
// Phase 2 — Update is not applicable here because there are no dependencies
//Phase 3 — Unmount (component is removed) return () => clearInterval(interval);

//  ┌────────────────────────────┐
//  │ Component Mounts           │
//  │ (DashboardPage appears)    │
//  └────────────┬───────────────┘
//               │
//               ▼
//      setInterval() starts
//      ├── Runs every 4 sec
//      └── Updates tipIndex (0→1→2→3→0)
//               │
//               ▼
//       Component Unmounts
//  (user leaves Dashboard page)
//               │
//               ▼
//      clearInterval() runs
//      └── Interval stopped, memory cleared
