"use client";

import { useState, useEffect } from "react";
import type { Block } from "@/types/CourseContent";

export type OllamaStatus = "checking" | "connected" | "disconnected";
export type ChatMessage = { role: "user" | "assistant"; content: string; thinking?: string };

interface AiStatusResponse {
    connected: boolean;
    models: string[];
    version: string | null;
}

type SseEvent =
    | { type: "chunk"; content: string }
    | { type: "thinking"; content: string }
    | { type: "done"; blocks: Block[] | null }
    | { type: "error"; message: string };

interface UseChatSessionProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    currentBlocks: Block[];
    onBlocksUpdate: (blocks: Block[]) => void;
    enabled: boolean;
}

export function useChatSession({
    moduleSlug,
    sectionSlug,
    contentType,
    currentBlocks,
    onBlocksUpdate,
    enabled,
}: UseChatSessionProps) {
    const [status, setStatus] = useState<OllamaStatus>("checking");
    const [ollamaVersion, setOllamaVersion] = useState<string | null>(null);
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;

        fetch("/api/admin/content/ai-status")
            .then((r) => r.json() as Promise<AiStatusResponse>)
            .then((data) => {
                if (cancelled) return;
                if (data.connected) {
                    setStatus("connected");
                    setOllamaVersion(data.version);
                    setModels(data.models);
                    setSelectedModel((prev) => prev || data.models[0] || "");
                } else {
                    setStatus("disconnected");
                    setModels([]);
                    setOllamaVersion(null);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setStatus("disconnected");
                    setModels([]);
                    setOllamaVersion(null);
                }
            });

        return () => { cancelled = true; };
    }, [enabled, refreshKey]);

    function retry() {
        setStatus("checking");
        setRefreshKey((k) => k + 1);
    }

    async function handleSend() {
        const text = input.trim();
        if (!text || loading || !selectedModel) return;

        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/content/ai-assist-local", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    model: selectedModel,
                    history: messages,
                    currentBlocks,
                    moduleSlug,
                    sectionSlug,
                    contentType,
                }),
            });

            if (!res.ok || !res.body) {
                setMessages((prev) => [...prev, { role: "assistant", content: "Erreur de communication avec Ollama." }]);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let lineBuffer = "";
            let firstChunk = true;
            let pendingThinking = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                lineBuffer += decoder.decode(value, { stream: true });
                const lines = lineBuffer.split("\n");
                lineBuffer = lines.pop() ?? "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    let event: SseEvent;
                    try { event = JSON.parse(line.slice(6)) as SseEvent; } catch { continue; }

                    if (event.type === "thinking") {
                        pendingThinking += event.content;
                    } else if (event.type === "chunk") {
                        if (firstChunk) {
                            firstChunk = false;
                            setLoading(false);
                            setMessages((prev) => [...prev, {
                                role: "assistant",
                                content: event.content,
                                ...(pendingThinking ? { thinking: pendingThinking } : {}),
                            }]);
                            pendingThinking = "";
                        } else {
                            setMessages((prev) => {
                                const last = prev[prev.length - 1];
                                return [...prev.slice(0, -1), { ...last, content: last.content + event.content }];
                            });
                        }
                    } else if (event.type === "done") {
                        if (event.blocks) onBlocksUpdate(event.blocks);
                    } else if (event.type === "error") {
                        if (firstChunk) {
                            setLoading(false);
                            setMessages((prev) => [...prev, { role: "assistant", content: event.message }]);
                        }
                    }
                }
            }

            if (firstChunk) {
                setMessages((prev) => [...prev, {
                    role: "assistant",
                    content: "Pas de réponse.",
                    ...(pendingThinking ? { thinking: pendingThinking } : {}),
                }]);
            }
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", content: "Erreur de communication avec Ollama." }]);
        } finally {
            setLoading(false);
        }
    }

    return {
        status, ollamaVersion, models, selectedModel, setSelectedModel,
        messages, input, setInput, loading, handleSend, retry,
    };
}
