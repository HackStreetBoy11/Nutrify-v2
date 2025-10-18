"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white text-gray-800">
      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between px-8 lg:px-24 py-20 gap-10">
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left"
        >
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-green-700">
            Track Your Daily Nutrition <br />
            with <span className="text-green-500">Nutrify</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
            Stay healthy by tracking your daily calories, proteins, carbs, and fats.
            Nutrify helps you build better eating habits effortlessly.
          </p>
          <div className="mt-8 flex justify-center lg:justify-start gap-4">
            <Link href='dashboard'>
              <Button className="bg-green-500 text-white hover:bg-green-600">
                Get Started
              </Button>
            </Link>
            <Link href='track'>
              <Button
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                Track Now
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex justify-center"
        >
          <Image
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
            alt="Healthy Food"
            width={500}
            height={400}
            className="rounded-2xl shadow-xl"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 lg:px-20 bg-white">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-12 text-green-700"
        >
          Why Choose Nutrify?
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Daily Nutrient Tracking",
              desc: "Track calories, proteins, carbs, and fats in one place.",
              img: "https://images.unsplash.com/photo-1556912167-f556f1f39df3?w=800",
            },
            {
              title: "Visual Insights",
              desc: "See your progress through charts and insights that motivate you.",
              img: "https://images.unsplash.com/photo-1576065435205-6f6b7d1a0f5d?w=800",
            },
            {
              title: "Smart Recommendations",
              desc: "Get personalized food suggestions to meet your goals.",
              img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-green-50 rounded-2xl shadow-md hover:shadow-lg transition p-6 text-center"
            >
              <Image
                src={feature.img}
                alt={feature.title}
                width={400}
                height={250}
                className="rounded-xl mb-4 mx-auto"
              />
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-100 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-green-700 mb-4"
        >
          Start Your Health Journey Today!
        </motion.h2>
        <p className="text-gray-700 mb-8">
          Join thousands of users tracking their nutrition with Nutrify.
        </p>
        <Button className="bg-green-500 text-white hover:bg-green-600">
          Get Started for Free
        </Button>
      </section>
    </main>
  );
}
