import { create } from "zustand";
import aiService from "../services/aiService";
import { toast } from "react-hot-toast";

export const useAIStore = create((set) => ({
    messages: [], // Array of { role: 'user' | 'assistant', content: string }
    isLoading: false,

    sendMessage: async (prompt) => {
        // Add user message immediately
        set((state) => ({
            messages: [...state.messages, { role: "user", content: prompt }],
            isLoading: true,
        }));

        try {
            const data = await aiService.getAdvice(prompt);
            // Add AI response
            set((state) => ({
                messages: [
                    ...state.messages,
                    { role: "assistant", content: data.response },
                ],
            }));
        } catch (error) {
            console.error("AI error:", error);
            toast.error("Failed to get AI response. Please try again.");
            // Optionally remove the user message or add an error message
        } finally {
            set({ isLoading: false });
        }
    },

    clearChat: () => {
        set({ messages: [] });
    }
}));
