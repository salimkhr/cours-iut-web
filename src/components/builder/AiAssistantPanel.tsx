"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
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
            setResponse("Erreur de communication avec l'assistant.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* FAB — désactivé temporairement (route AI à corriger) */}
            <button
                disabled
                aria-label="Assistant IA (désactivé)"
                className="fixed bottom-6 right-6 z-50 bg-bridge-400 dark:bg-bridge-600 text-bridge-50 rounded-full w-11 h-11 flex items-center justify-center shadow-md opacity-40 cursor-not-allowed"
            >
                {open
                    ? <X className="w-5 h-5" />
                    : <Sparkles className="w-5 h-5" />
                }
            </button>

            {/* Panel */}
            {open && (
                <div className="fixed bottom-20 right-6 z-50 w-80 bg-bridge-50 dark:bg-bridge-900 border border-bridge-500/20 dark:border-bridge-500/35 rounded-xl shadow-[0_12px_32px_-12px_rgba(147,97,58,0.45)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">

                    <div className="flex items-center justify-between px-4 py-3 border-b border-bridge-500/20 dark:border-bridge-500/35">
                        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary dark:text-brand-primary flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            Assistant IA
                        </span>
                        <button
                            aria-label="Fermer"
                            className="text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200 transition-colors cursor-pointer"
                            onClick={() => setOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-3 flex flex-col gap-3">
                        <Textarea
                            placeholder="Ex : Ajoute 3 blocs texte expliquant le DOM..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="text-sm border-bridge-400/40 dark:border-bridge-500/40 bg-bridge-100/50 dark:bg-bridge-800/50 resize-none"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.metaKey) void handleSend();
                            }}
                        />

                        {response && (
                            <div className="text-sm text-bridge-700 dark:text-bridge-300 bg-bridge-100 dark:bg-bridge-800 border border-bridge-400/30 dark:border-bridge-500/30 rounded-lg p-3 leading-relaxed">
                                {response}
                            </div>
                        )}

                        <Button
                            size="sm"
                            onClick={() => void handleSend()}
                            disabled={loading || !message.trim()}
                            className="bg-brand-primary hover:bg-brand-accent-dark text-brand-light gap-1.5 h-8 text-xs disabled:opacity-40"
                        >
                            {loading
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> En cours…</>
                                : <><Sparkles className="w-3.5 h-3.5" /> Envoyer (⌘↵)</>
                            }
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
