"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBuilderStore } from "@/lib/store/builderStore";

interface AiAssistantPanelProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export function AiAssistantPanel({ moduleSlug, sectionSlug, contentType }: AiAssistantPanelProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const { blocks, setBlocks } = useBuilderStore();

    async function handleSend() {
        if (!message.trim()) return;
        setLoading(true);
        setResponse("");

        try {
            const res = await fetch("/api/admin/content/ai-assist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    currentBlocks: blocks,
                    moduleSlug,
                    sectionSlug,
                    contentType,
                }),
            });
            const data = await res.json() as { text: string; blocks?: typeof blocks };
            setResponse(data.text || "Fait.");
            if (data.blocks) {
                setBlocks(data.blocks);
            }
        } catch {
            setResponse("Erreur de communication avec l&apos;assistant.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105 transition-transform text-lg"
                onClick={() => setOpen((v) => !v)}
                title="Assistant IA"
            >
                ✦
            </button>

            {open && (
                <div className="fixed bottom-20 right-6 z-50 w-80 bg-card border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <span className="font-semibold text-sm">Assistant IA</span>
                        <button
                            className="text-muted-foreground hover:text-foreground text-lg"
                            onClick={() => setOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="p-3 flex flex-col gap-3">
                        <Textarea
                            placeholder="Ex : Ajoute 3 blocs texte expliquant le DOM..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.metaKey) void handleSend();
                            }}
                        />

                        {response && (
                            <div className="text-sm text-muted-foreground bg-muted rounded p-2">
                                {response}
                            </div>
                        )}

                        <Button
                            size="sm"
                            onClick={() => void handleSend()}
                            disabled={loading || !message.trim()}
                        >
                            {loading ? "En cours..." : "Envoyer"}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
