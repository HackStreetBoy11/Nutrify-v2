import React from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default function LeftSide() {
  return (
    <div className="hidden lg:flex flex-col gap-6 sticky top-24 self-start">

      {/* Calories */}
      <Card className="hover:scale-105 transition-transform bg-red-100">
        <CardContent className="flex items-center gap-4">
          <Image
            src="https://img.icons8.com/color/96/fire-element--v1.png"
            alt="Calories"
            width={64}
            height={64}
          />
          <div>
            <CardTitle className="text-red-700">Calories</CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Fuel for your body — balance intake with activity.
            </CardDescription>
            <span className="inline-block mt-1 text-red-700 font-medium">
              Avg: 2000 kcal/day
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Protein */}
      <Card className="hover:scale-105 transition-transform bg-green-100">
        <CardContent className="flex items-center gap-4">
          <Image
            src="https://img.icons8.com/?size=80&id=NUPNDEQXdvXR&format=png"
            alt="Protein"
            width={64}
            height={64}
          />
          <div>
            <CardTitle className="text-green-700">Protein</CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Builds muscle & repairs tissues. Aim for each meal!
            </CardDescription>
            <span className="inline-block mt-1 text-green-700 font-medium">
              Avg: 50g/day
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Carbs */}
      <Card className="hover:scale-105 transition-transform bg-yellow-100">
        <CardContent className="flex items-center gap-4">
          <Image
            src="https://img.icons8.com/color/96/bread.png"
            alt="Carbs"
            width={64}
            height={64}
          />
          <div>
            <CardTitle className="text-yellow-700">Carbs</CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Main energy source — choose whole grains & fruits.
            </CardDescription>
            <span className="inline-block mt-1 text-yellow-700 font-medium">
              Avg: 275g/day
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Fats */}
      <Card className="hover:scale-105 transition-transform bg-blue-100">
        <CardContent className="flex items-center gap-4">
          <Image
            src="https://img.icons8.com/color/96/avocado.png"
            alt="Fats"
            width={64}
            height={64}
          />
          <div>
            <CardTitle className="text-blue-700">Fats</CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Supports hormones & brain health — pick healthy fats.
            </CardDescription>
            <span className="inline-block mt-1 text-blue-700 font-medium">
              Avg: 70g/day
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Habit Builder */}
      <Card className="hover:scale-105 transition-transform bg-primary text-primary-content">
        <CardContent>
          <CardTitle>🥗 Habit Builder</CardTitle>
          <CardDescription className="text-sm">
            Meal prep on weekends to save time & eat healthier all week.
          </CardDescription>
        </CardContent>
      </Card>

    </div>
  );
}
