import {create} from "zustand";
import {persist} from "zustand/middleware";

export type Message = {
    from: "user" | "bot";
    text: string;
    timestamp?: string;
};

type ChatStore = {
    messages: Message[];
    addMessage: (msg: Message) => void;
    updateLastBotMessage: (text: string, timestamp: string) => void;
    clearMessages: () => void;
};

export const useChatStore = create(
    persist<ChatStore>(
        (set) => ({
            messages: [],
            addMessage: (msg) =>
                set((state) => ({messages: [...state.messages, msg]})),
            clearMessages: () => set({messages: []}),
            updateLastBotMessage: (text: string, timestamp: string) => {
                useChatStore.setState((state) => {
                    const messages = [...state.messages];
                    const lastIndex = messages.map(m => m.from).lastIndexOf("bot");

                    if (lastIndex !== -1) {
                        messages[lastIndex] = {...messages[lastIndex], text, timestamp};
                    } else {
                        messages.push({from: "bot", text, timestamp});
                    }

                    return {messages};
                });
            }
        }),
        {
            name: "chat-store", // localStorage key
        }
    )
);