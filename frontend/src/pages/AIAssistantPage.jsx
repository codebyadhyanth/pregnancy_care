import { useState, useRef, useEffect } from "react";
import { useAIStore } from "../store/aiStore";
import { useAuthStore } from "../store/authStore";
import Card from "../components/ui/Card";
import GradientButton from "../components/ui/GradientButton";
import { Send, Bot, User, Loader, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

const AIAssistantPage = () => {
    const { messages, sendMessage, isLoading } = useAIStore();
    const { user } = useAuthStore();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const prompt = input;
        setInput("");
        await sendMessage(prompt);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col pb-4">
            <div className="text-center mb-6 space-y-2">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-gray-900">
                    <Sparkles className="w-8 h-8 text-pink-500" /> AI Care Assistant
                </h1>
                <p className="text-gray-500">Ask me anything about your pregnancy journey.</p>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm border-pink-100 shadow-xl">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-70">
                            <Bot className="w-16 h-16 text-pink-200" />
                            <p>Start a conversation...</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex gap-4 max-w-[80%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                msg.role === "user" ? "bg-pink-100" : "bg-gradient-to-br from-pink-500 to-rose-600"
                            )}>
                                {msg.role === "user" ? (
                                    <User className="w-6 h-6 text-pink-600" />
                                ) : (
                                    <Bot className="w-6 h-6 text-white" />
                                )}
                            </div>

                            <div className={cn(
                                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                msg.role === "user"
                                    ? "bg-pink-500 text-white rounded-tr-none"
                                    : "bg-white border border-pink-50 text-gray-800 rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 mr-auto max-w-[80%]">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div className="bg-white border border-pink-50 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-pink-50">
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
                            className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-pink-300 focus:outline-none transition-all placeholder-gray-400 text-gray-700"
                            disabled={isLoading}
                        />
                        <GradientButton
                            type="submit"
                            className="rounded-full w-14 h-14 p-0 flex items-center justify-center hover:scale-105"
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-0.5" />}
                        </GradientButton>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default AIAssistantPage;
