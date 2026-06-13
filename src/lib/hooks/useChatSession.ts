"use client";

import { useState, useEffect } from "react";
import type { Block } from "@/types/CourseContent";

export type OllamaStatus = "checking" | "connected" | "disconnected";
export type ChatMessage = {
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    timestamp: Date;
    toolActions?: { name: string; count: number }[];
    isError?: boolean;
};

interface AiStatusResponse {
    connected: boolean;
    models: string[];
    version: string | null;
}

type SseEvent =
    | { type: "chunk"; content: string }
    | { type: "thinking"; content: string }
    | { type: "action_summary"; tools: { name: string; count: number }[] }
    | { type: "done"; blocks: Block[] | null }
    | { type: "error"; message: string };

// timestamp arrive comme string depuis JSON.parse — on le rehydrate en Date
type SerializedMessage = Omit<ChatMessage, "timestamp"> & { timestamp: string };

function deserializeMessage(m: SerializedMessage): ChatMessage {
    return { ...m, timestamp: new Date(m.timestamp) };
}

function toStoredMessage(msg: ChatMessage): Omit<ChatMessage, "isError"> {
    const { isError: _isError, ...rest } = msg;
    return rest;
}

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
    const [historyLoading, setHistoryLoading] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);

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

    useEffect(() => {
        if (!enabled) return;
        // setTimeout(0) : interdit d'appeler setState synchronement dans le corps d'un effet (ESLint react-hooks/set-state-in-effect)
        const timer = setTimeout(() => setHistoryLoading(true), 0);
        fetch(
            `/api/admin/content/ai-chat-history?module=${encodeURIComponent(moduleSlug)}&section=${encodeURIComponent(sectionSlug)}&type=${encodeURIComponent(contentType)}`,
        )
            .then((r) => r.json() as Promise<{ messages: SerializedMessage[] }>)
            .then((data) => { setMessages(data.messages.map(deserializeMessage)); })
            .catch(() => { /* démarrer vide si erreur réseau */ })
            .finally(() => {
                clearTimeout(timer);
                setHistoryLoading(false);
            });
        return () => { clearTimeout(timer); };
    }, [enabled, moduleSlug, sectionSlug, contentType]);

    function retry() {
        setStatus("checking");
        setRefreshKey((k) => k + 1);
    }

    function persistExchange(userMsg: ChatMessage, assistantMsg: ChatMessage) {
        fetch("/api/admin/content/ai-chat-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                moduleSlug,
                sectionSlug,
                contentType,
                messages: [toStoredMessage(userMsg), toStoredMessage(assistantMsg)],
            }),
        }).catch(() => { /* best-effort — silencieux en cas d'échec réseau */ });
    }

    async function clearHistory() {
        await fetch("/api/admin/content/ai-chat-history", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleSlug, sectionSlug, contentType }),
        });
        setMessages([]);
        setConfirmClear(false);
    }

    async function handleSend() {
        const text = input.trim();
        if (!text || loading || historyLoading || !selectedModel) return;

        const userMsg: ChatMessage = { role: "user", content: text, timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        // Variables pour la persistance — renseignées au fil du stream
        let assistantMsg: ChatMessage | null = null;
        let assistantContent = "";
        let receivedDone = false;

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
                let detail = `HTTP ${res.status}`;
                try { const j = await res.json() as { error?: string }; if (j.error) detail = j.error; } catch { /* ignore */ }
                setMessages((prev) => [...prev, { role: "assistant", content: `Erreur : ${detail}`, timestamp: new Date(), isError: true }]);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let lineBuffer = "";
            let firstChunk = true;
            let pendingThinking = "";
            let pendingToolActions: { name: string; count: number }[] | undefined;

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
                    } else if (event.type === "action_summary") {
                        pendingToolActions = event.tools;
                    } else if (event.type === "chunk") {
                        if (firstChunk) {
                            firstChunk = false;
                            setLoading(false);
                            assistantMsg = {
                                role: "assistant",
                                content: event.content,
                                timestamp: new Date(),
                                ...(pendingThinking ? { thinking: pendingThinking } : {}),
                                ...(pendingToolActions ? { toolActions: pendingToolActions } : {}),
                            };
                            assistantContent = event.content;
                            setMessages((prev) => [...prev, assistantMsg!]);
                            pendingThinking = "";
                            pendingToolActions = undefined;
                        } else {
                            assistantContent += event.content;
                            setMessages((prev) => {
                                const last = prev[prev.length - 1];
                                return [...prev.slice(0, -1), { ...last, content: last.content + event.content }];
                            });
                        }
                    } else if (event.type === "done") {
                        if (event.blocks) onBlocksUpdate(event.blocks);
                        receivedDone = true;
                    } else if (event.type === "error") {
                        if (firstChunk) {
                            setLoading(false);
                            setMessages((prev) => [...prev, { role: "assistant", content: event.message, timestamp: new Date(), isError: true }]);
                        }
                    }
                }
            }

            if (firstChunk) {
                setMessages((prev) => [...prev, {
                    role: "assistant",
                    content: "Pas de réponse.",
                    timestamp: new Date(),
                    isError: true,
                    ...(pendingThinking ? { thinking: pendingThinking } : {}),
                    ...(pendingToolActions ? { toolActions: pendingToolActions } : {}),
                }]);
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setMessages((prev) => [...prev, { role: "assistant", content: `Erreur réseau : ${msg}`, timestamp: new Date(), isError: true }]);
        } finally {
            setLoading(false);
        }

        // Persister uniquement les échanges complets (done reçu) sans erreur
        if (assistantMsg && receivedDone) {
            persistExchange(userMsg, { ...assistantMsg, content: assistantContent });
        }
    }

    return {
        status, ollamaVersion, models, selectedModel, setSelectedModel,
        messages, input, setInput, loading, handleSend, retry,
        historyLoading, confirmClear, setConfirmClear, clearHistory,
    };
}
