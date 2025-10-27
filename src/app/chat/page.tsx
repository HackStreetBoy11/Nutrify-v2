// app/chat/page.tsx
import Chatbot from "@/components/Chatbot";

export default function ChatPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-8">
            <div className="w-full max-w-4xl">
                <Chatbot />
            </div>
        </main>
    );
}
