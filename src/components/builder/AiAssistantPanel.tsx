"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Sparkles, X, WifiOff, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useBuilderStore } from "@/lib/store/builderStore";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/CourseContent";

type OllamaStatus = "checking" | "connected" | "disconnected";
type ChatMessage = { role: "user" | "assistant"; content: string };

interface AiStatusResponse {
    connected: boolean;
    models: string[];
    version: string | null;
}

interface AiAssistResponse {
    text?: string;
    blocks?: Block[];
    error?: string;
}

interface AiAssistantPanelProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export function AiAssistantPanel({ moduleSlug, sectionSlug, contentType }: AiAssistantPanelProps) {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<OllamaStatus>("checking");
    const [ollamaVersion, setOllamaVersion] = useState<string | null>(null);
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { blocks, setBlocks } = useBuilderStore();

    // Déclencher le check de statut Ollama — toutes les setState sont dans .then/.catch (async),
    // jamais synchrones dans le corps de l'effet.
    useEffect(() => {
        if (!open) return;

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
    }, [open, refreshKey]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    function handleOpen() {
        // setStatus("checking") ici est dans un event handler — pas dans un effet
        setStatus("checking");
        setOpen(true);
    }

    function handleRetry() {
        setStatus("checking");
        setRefreshKey((k) => k + 1);
    }

    async function handleSend() {
        const text = input.trim();
        if (!text || loading || !selectedModel) return;

        const userMsg: ChatMessage = { role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
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
                    currentBlocks: blocks,
                    moduleSlug,
                    sectionSlug,
                    contentType,
                }),
            });
            const data = await res.json() as AiAssistResponse;
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.error ?? data.text ?? "Pas de réponse." },
            ]);
            if (data.blocks) setBlocks(data.blocks);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Erreur de communication avec Ollama." },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* FAB */}
            <button
                aria-label={open ? "Fermer l'assistant IA" : "Ouvrir l'assistant IA local"}
                onClick={open ? () => setOpen(false) : handleOpen}
                className={cn(
                    "fixed bottom-6 right-6 z-50 rounded-full w-11 h-11 flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer",
                    open
                        ? "bg-brand-primary text-brand-light hover:bg-brand-accent-dark"
                        : "bg-bridge-100 dark:bg-bridge-800 border border-bridge-400/40 dark:border-bridge-500/40 text-bridge-600 dark:text-bridge-300 hover:border-brand-primary/50 hover:text-brand-primary",
                )}
            >
                {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </button>

            {/* Panel */}
            {open && (
                <div className="fixed bottom-20 right-6 z-50 w-[380px] max-h-[600px] bg-bridge-50 dark:bg-bridge-900 border border-bridge-500/20 dark:border-bridge-500/35 rounded-xl shadow-[0_12px_40px_-12px_rgba(147,97,58,0.4)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-bridge-500/20 dark:border-bridge-500/35 flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary flex-1 min-w-0 truncate">
                            Assistant IA local
                        </span>

                        {/* Indicateur de statut Ollama */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                status === "connected" && "bg-emerald-500",
                                status === "disconnected" && "bg-red-500",
                                status === "checking" && "bg-amber-400 animate-pulse",
                            )} />
                            <span className={cn(
                                "text-[10px] font-mono",
                                status === "connected" && "text-emerald-600 dark:text-emerald-400",
                                status === "disconnected" && "text-red-500 dark:text-red-400",
                                status === "checking" && "text-amber-600 dark:text-amber-400",
                            )}>
                                {status === "connected"
                                    ? (ollamaVersion ? `v${ollamaVersion}` : "connecté")
                                    : status === "disconnected"
                                        ? "déconnecté"
                                        : "…"}
                            </span>
                        </div>

                        <button
                            aria-label="Fermer"
                            onClick={() => setOpen(false)}
                            className="text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200 transition-colors cursor-pointer ml-1 flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Sélecteur de modèle */}
                    {status === "connected" && models.length > 0 && (
                        <div className="px-4 py-2 border-b border-bridge-500/10 dark:border-bridge-500/20 flex-shrink-0">
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="h-7 text-xs border-bridge-400/30 dark:border-bridge-500/30 bg-bridge-100/50 dark:bg-bridge-800/50 font-mono">
                                    <SelectValue placeholder="Choisir un modèle…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map((m) => (
                                        <SelectItem key={m} value={m} className="text-xs font-mono">
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* État : connexion en cours */}
                    {status === "checking" && (
                        <div className="flex-1 flex items-center justify-center gap-2.5 py-12 text-bridge-500 dark:text-bridge-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Connexion à Ollama…</span>
                        </div>
                    )}

                    {/* État : Ollama non disponible */}
                    {status === "disconnected" && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <WifiOff className="w-6 h-6 text-red-500 dark:text-red-400" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <p className="text-sm font-semibold text-bridge-800 dark:text-bridge-100">
                                    Ollama non connecté
                                </p>
                                <p className="text-xs text-bridge-500 dark:text-bridge-400 leading-relaxed">
                                    Démarrez Ollama sur ce serveur avec :
                                </p>
                            </div>
                            <code className="text-xs bg-bridge-900 dark:bg-bridge-950 text-emerald-400 font-mono px-3 py-2 rounded-lg w-full text-left select-all">
                                ollama serve
                            </code>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-7 text-xs border-bridge-400/40 hover:border-brand-primary/50 hover:text-brand-primary transition-colors cursor-pointer"
                                onClick={handleRetry}
                            >
                                <RefreshCw className="w-3 h-3" /> Réessayer
                            </Button>
                        </div>
                    )}

                    {/* État : connecté mais aucun modèle */}
                    {status === "connected" && models.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <p className="text-sm font-semibold text-bridge-800 dark:text-bridge-100">
                                    Aucun modèle installé
                                </p>
                                <p className="text-xs text-bridge-500 dark:text-bridge-400 leading-relaxed">
                                    Téléchargez un modèle avec :
                                </p>
                            </div>
                            <code className="text-xs bg-bridge-900 dark:bg-bridge-950 text-emerald-400 font-mono px-3 py-2 rounded-lg w-full text-left select-all">
                                ollama pull llama3.2
                            </code>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-7 text-xs border-bridge-400/40 hover:border-brand-primary/50 hover:text-brand-primary transition-colors cursor-pointer"
                                onClick={handleRetry}
                            >
                                <RefreshCw className="w-3 h-3" /> Actualiser
                            </Button>
                        </div>
                    )}

                    {/* État : connecté avec modèles — zone de messages */}
                    {status === "connected" && models.length > 0 && (
                        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center gap-2 text-center py-8 flex-1">
                                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-brand-primary" />
                                    </div>
                                    <p className="text-xs text-bridge-500 dark:text-bridge-400 max-w-[220px] leading-relaxed">
                                        Décrivez ce que vous souhaitez créer ou modifier dans le cours.
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex",
                                        msg.role === "user" ? "justify-end" : "justify-start",
                                    )}
                                >
                                    <div className={cn(
                                        "max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                                        msg.role === "user"
                                            ? "bg-brand-primary text-brand-light rounded-br-sm"
                                            : "bg-bridge-100 dark:bg-bridge-800 text-bridge-700 dark:text-bridge-300 border border-bridge-400/20 dark:border-bridge-500/25 rounded-bl-sm",
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {/* Indicateur de génération en cours */}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-bridge-100 dark:bg-bridge-800 border border-bridge-400/20 dark:border-bridge-500/25 rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-bridge-400 dark:bg-bridge-500 rounded-full animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 bg-bridge-400 dark:bg-bridge-500 rounded-full animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 bg-bridge-400 dark:bg-bridge-500 rounded-full animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Footer — zone de saisie */}
                    {status === "connected" && models.length > 0 && (
                        <div className="flex-shrink-0 border-t border-bridge-500/15 dark:border-bridge-500/20 px-3 py-3 flex gap-2 items-end">
                            <Textarea
                                placeholder="Décrivez une modification… (⌘↵ ou Ctrl↵)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={2}
                                className="text-xs border-bridge-400/30 dark:border-bridge-500/30 bg-bridge-100/50 dark:bg-bridge-800/50 resize-none flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSend();
                                }}
                            />
                            <Button
                                size="icon"
                                onClick={() => void handleSend()}
                                disabled={loading || !input.trim() || !selectedModel}
                                aria-label="Envoyer"
                                className="h-8 w-8 flex-shrink-0 bg-brand-primary hover:bg-brand-accent-dark text-brand-light disabled:opacity-40 mb-px cursor-pointer"
                            >
                                {loading
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Send className="w-3.5 h-3.5" />
                                }
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
