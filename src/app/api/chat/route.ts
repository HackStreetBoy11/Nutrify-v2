import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: Request) {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ✅ Use fetchQuery instead of useQuery
    const convexUser = await fetchQuery(api.users.getUserByClerkId, {
        clerkId: user.id,
    });
    // console.log("Convex user:", convexUser);

    // Handle if user not found in Convex
    if (!convexUser?._id) {
        return NextResponse.json({ error: "User not found in Convex" }, { status: 404 });
    }

    const { message } = await req.json();
    // ✅ Fetch user’s food history from Convex
    const history = await fetchQuery(api.trackedFood.getTrackedFoods, {
        userId: convexUser._id,
    });

    // ✅ Prepare context for chatbot
    const context = `
User's recent food history: ${JSON.stringify(history.slice(-5))}
User's question: ${message}
`;

    // console.log(context)
    // ✅ Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a nutrition assistant for the app Nutrify." },
                { role: "user", content: context },
            ],
        }),
    });

    const data = await response.json();
    console.log("📥 OpenAI response:", data);
    // ✅ Check for errors from OpenAI
    if (data.error) {
        console.error("❌ OpenAI error:", data.error);
        return NextResponse.json({
            reply: "There was an issue generating a response. Please try again later.",
        });
    }
    // ✅ Safely extract AI’s message
    const reply =
        data?.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I couldn’t generate a response.";
    // ✅ Log reply for debugging
    console.log("🧠 Chatbot reply:", reply);
    // ✅ Return only the message to frontend
    return NextResponse.json({ reply });

}
