import React from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default function RightSide() {
    return (
        <div className="hidden lg:flex flex-col gap-6 justify-center sticky top-24 self-start">

            {/* Fresh Fruits Image */}
            <Card className="hover:scale-105 transition-transform">
                <CardContent>
                    <Image
                        src="https://images.unsplash.com/photo-1506807803488-8eafc15316c7?w=400"
                        alt="Fresh Fruits"
                        width={400}
                        height={300}
                        className="rounded-lg shadow-lg"
                    />
                </CardContent>
            </Card>

            {/* Quick Tip */}
            <Card className="hover:scale-105 transition-transform bg-secondary text-secondary-content">
                <CardContent>
                    <CardTitle>💡 Quick Tip</CardTitle>
                    <CardDescription className="text-sm">
                        Half your plate should be veggies & fruits for optimal nutrition.
                    </CardDescription>
                </CardContent>
            </Card>

            {/* Healthy Salad Bowl Image */}
            <Card className="hover:scale-105 transition-transform">
                <CardContent>
                    <Image
                        src="https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=500&auto=format&fit=crop&q=60"
                        alt="Healthy Salad Bowl"
                        width={400}
                        height={400}
                        className="object-cover rounded-lg shadow-lg"
                    />
                </CardContent>
            </Card>

        </div>
    );
}
