import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: Request) {
    // STEP 1 — Authenticate: get current user from Clerk server-side helper
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // NOTE: server-side currentUser() reads cookie/session and returns user info or null

    // STEP 2 — Fetch Convex user record by the Clerk id (server-side query)
    //         fetchQuery runs on the server and queries the Convex backend directly
    // ✅ Use fetchQuery instead of useQuery
    const convexUser = await fetchQuery(api.users.getUserByClerkId, {
        clerkId: user.id,
    });
    // STEP 2.1 — If Convex doesn't have a matching user document, return 404
    // Handle if user not found in Convex
    if (!convexUser?._id) {
        return NextResponse.json({ error: "User not found in Convex" }, { status: 404 });
    }
    // STEP 3 — Parse user request body (the user's message)
    const { message } = await req.json();

    // STEP 4 — Fetch user's tracked food history from Convex (server-side)
    //          Here we fetch all tracked foods for the user (used to provide context to the LLM)
    const history = await fetchQuery(api.trackedFood.getTrackedFoods, {
        userId: convexUser._id,
    });

    // STEP 5 — Build context string for the LLM prompt
    //          We slice(-5) to include only the last 5 entries for conciseness
    // ✅ Prepare context for chatbot
    const context = `
                    User's recent food history: ${JSON.stringify(history)}
                        User's question: ${message}
`;

    // STEP 6 — Call OpenAI Chat Completions (server-side; safe to keep API key on server)
    //          You should ensure process.env.OPENAI_API_KEY is set in your environment / hosting
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
    // STEP 7 — Parse OpenAI response JSON
    const data = await response.json();
    console.log("📥 OpenAI response:", data);
    // ✅ Check for errors from OpenAI
    console.log("🧾 Token usage:", data.usage);
    if (data.usage) {
        const total = data.usage.total_tokens || 0;
        const cost = (total / 1_000_000) * 0.15; // approximate for gpt-4o-mini
        console.log(`💰 Estimated cost: ~$${cost.toFixed(6)} for this request`);
    }

    // STEP 8 — Error handling: if OpenAI returns an error, return a friendly message
    if (data.error) {
        console.error("❌ OpenAI error:", data.error);
        return NextResponse.json({
            reply: "There was an issue generating a response. Please try again later.",
        });
    }

    // STEP 9 — Extract the assistant message safely
    const reply =
        data?.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I couldn’t generate a response.";
    // ✅ Log reply for debugging
    console.log("🧠 Chatbot reply:", reply);
    // ✅ Return only the message to frontend
    return NextResponse.json({ reply });

}
