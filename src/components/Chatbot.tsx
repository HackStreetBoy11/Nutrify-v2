"use client";
import { useState, useRef, useEffect } from "react";

// Helper: renders structured bot messages (bullets, numbered, bold, headers, plain)
function formatBotMessage(text: string) {
  const lines = text.split("\n").filter(Boolean);

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        // Bullet line: starts with -, *, or •
        if (/^[-*•]\s+/.test(line)) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span>{line.replace(/^[-*•]\s+/, "")}</span>
            </div>
          );
        }
        // Numbered line: starts with 1. 2. etc
        if (/^\d+\.\s+/.test(line)) {
          const num = line.match(/^(\d+)\./)?.[1];
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                {num}
              </span>
              <span>{line.replace(/^\d+\.\s+/, "")}</span>
            </div>
          );
        }
        // Bold text: **text**
        if (/\*\*(.+?)\*\*/.test(line)) {
          return (
            <p key={i} className="font-semibold text-gray-900">
              {line.replace(/\*\*(.+?)\*\*/g, "$1")}
            </p>
          );
        }
        // Section header: line ending with colon
        if (line.trim().endsWith(":")) {
          return (
            <p key={i} className="font-semibold text-gray-700 mt-1">
              {line}
            </p>
          );
        }
        // Regular line
        return <p key={i} className="leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

export default function Chatbot() {
  // STEP 1 — Component initialization / local state
  // messages: chat history shown in UI (starts with bot greeting)
  // input: controlled input field value
  // loading: prevents duplicate sends and shows "Thinking..."
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi! I'm your nutrition assistant. Ask me about your diet or food history 🍎",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // STEP 2 — scroll ref so we can auto-scroll to bottom when messages change
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // STEP 3 — helper to scroll the chat to the latest message
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // STEP 4 — effect: run scrollToBottom whenever messages update
  // (so the chat auto-scrolls when user or bot sends a message)
  useEffect(scrollToBottom, [messages]);

  // STEP 5 — sendMessage flow (executed when user presses Enter or clicks Send)
  const sendMessage = async () => {
    // 5.1 — guard: don't send empty or while a previous send is loading
    if (!input.trim() || loading) return;

    // 5.2 — create and append the user's message locally immediately (optimistic UI)
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    // 5.3 — clear input field and set loading UI state
    setInput("");
    setLoading(true);

    try {
      // 5.4 — call server API: POST /api/chat with the user's input
      //        The server will call Convex (for user/history) and OpenAI (LLM)
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      // 5.5 — parse server response JSON (should contain { reply })
      const data = await res.json();

      // 5.7 — append bot's reply to messages (updates UI)
      const botReply = data.reply || "⚠️ No response from server.";
      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch (err) {
      // 5.8 — network/server error handling: append error message to chat
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Failed to connect to server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // STEP 6 — JSX: render chat UI (header, messages, input)
  // Messages map renders user messages to right and bot messages to left.
  // The loading state shows "🤖 Thinking..." while awaiting server.
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 text-white text-center py-3 font-semibold text-lg">
          Nutrify Chatbot 🥦
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                  msg.role === "user"
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {/* ✅ Only change: bot messages use formatBotMessage, user messages stay plain */}
                {msg.role === "bot" ? formatBotMessage(msg.text) : msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-gray-400 text-sm text-center animate-pulse">
              🤖 Thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex border-t bg-gray-50 p-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-l-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-r-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}