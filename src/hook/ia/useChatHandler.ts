import {useState} from 'react';
import {useChatStore} from '@/lib/store/useChatStore';
import useFormattedDate from "@/hook/ia/useFormattedDate";


type ChatChunk = {
    model: string;
    created_at: string;
    content: string;
    done: boolean;
    done_reason?: string;
    context?: number[];
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
};

export default function useChatHandler() {
    const {addMessage, updateLastBotMessage} = useChatStore();
    const [isTyping, setIsTyping] = useState(false);

    const {formatDate} = useFormattedDate();

    const sendMessage = async (input: string) => {
        if (!input.trim()) return;

        const formattedDate = formatDate();
        addMessage({from: "user", text: input, timestamp: formattedDate});

        setIsTyping(true);

        let botMsg = "";
        addMessage({from: "bot", text: "", timestamp: formattedDate});

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({message: input}),
            });

            if (!res.body) {
                throw new Error("No response body");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const {value, done} = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, {stream: true});

                const {events, remainder} = parseStreamChunk(buffer);
                buffer = remainder;

                for (const data of events) {
                    // Concatène la réponse partielle
                    if (data.content) {
                        botMsg += data.content;
                    }
                    updateLastBotMessage(botMsg);
                }
            }
            setIsTyping(false);
        } catch (error) {
            console.error(error);
            setIsTyping(false);
        }
    };

    return {sendMessage, isTyping};
}

function parseStreamChunk(buffer: string): { events: ChatChunk[], remainder: string } {
    const lines = buffer.split("\n");
    const events: ChatChunk[] = [];


    // Parcourir toutes les lignes sauf la dernière (potentiellement incomplète)
    for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();

        if (!line) continue;

        // On s'attend à un format SSE : "data: {...json...}"
        if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim(); // Extraire la partie JSON après "data: "
            if (jsonStr !== '[DONE]') {
                try {
                    const json = JSON.parse(jsonStr);
                    events.push(json);
                } catch (e) {
                    console.error("Erreur JSON parse line:", jsonStr, e);
                }
            }
        } else {
            // Optionnel: log ou ignore les lignes sans "data: "
            console.warn("Ligne SSE ignorée (pas de 'data: '):", line);
        }
    }

    // La dernière ligne est mise en remainder pour concat avec la suite
    const remainder = lines[lines.length - 1];

    return {events, remainder};
}
