"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Sparkles, WifiOff, RefreshCw, Send, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/CourseContent";
import { useChatSession } from "@/lib/hooks/useChatSession";

interface StandaloneChatPanelProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    moduleTitle: string;
    sectionTitle: string;
    initialBlocks: Block[];
}

export function StandaloneChatPanel({
    moduleSlug,
    sectionSlug,
    contentType,
    moduleTitle,
    sectionTitle,
    initialBlocks,
}: StandaloneChatPanelProps) {
    const [currentBlocks, setCurrentBlocks] = useState<Block[]>(initialBlocks);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const broadcastRef = useRef<BroadcastChannel | null>(null);

    // Canal de communication vers la fenêtre principale
    useEffect(() => {
        if (typeof BroadcastChannel === "undefined") return;
        broadcastRef.current = new BroadcastChannel("builder-blocks");
        // Recevoir les mises à jour du builder principal
        broadcastRef.current.onmessage = (e: MessageEvent<{ type: string; blocks: Block[] }>) => {
            if (e.data.type === "blocks-updated") setCurrentBlocks(e.data.blocks);
        };
        return () => broadcastRef.current?.close();
    }, []);

    function handleBlocksUpdate(blocks: Block[]) {
        setCurrentBlocks(blocks);
        broadcastRef.current?.postMessage({ type: "blocks-updated", blocks });
    }

    function handleReturnToMain() {
        broadcastRef.current?.postMessage({ type: "panel-focus" });
        window.opener?.focus();
        window.close();
    }

    const chat = useChatSession({
        moduleSlug, sectionSlug, contentType,
        currentBlocks,
        onBlocksUpdate: handleBlocksUpdate,
        enabled: true,
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat.messages, chat.loading]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.altKey) {
            e.preventDefault();
            void chat.handleSend();
        } else if (e.key === "Enter" && e.altKey) {
            e.preventDefault();
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart ?? 0;
            const end = ta.selectionEnd ?? 0;
            const newVal = ta.value.slice(0, start) + "\n" + ta.value.slice(end);
            chat.setInput(newVal);
            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = start + 1;
                    textareaRef.current.selectionEnd = start + 1;
                }
            });
        }
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-h))] bg-bridge-50 dark:bg-bridge-900">

            {/* Header contexte */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90 backdrop-blur-sm flex-shrink-0">
                <Sparkles className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-xs leading-none">
                        <span className="font-semibold text-bridge-700 dark:text-bridge-200 truncate">{moduleTitle}</span>
                        <span className="text-bridge-400 dark:text-bridge-600 shrink-0">›</span>
                        <span className="text-bridge-500 dark:text-bridge-400 truncate">{sectionTitle}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-primary">{contentType}</span>
                </div>
                {/* Bouton retour dans le builder */}
                <button
                    aria-label="Retourner dans le builder"
                    onClick={handleReturnToMain}
                    title="Rouvrir dans le builder"
                    className="text-bridge-500 dark:text-bridge-400 hover:text-brand-primary transition-colors cursor-pointer flex-shrink-0"
                >
                    <PanelRightOpen className="w-4 h-4" />
                </button>
                {/* Indicateur Ollama */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        chat.status === "connected" && "bg-emerald-500",
                        chat.status === "disconnected" && "bg-red-500",
                        chat.status === "checking" && "bg-amber-400 animate-pulse",
                    )} />
                    <span className={cn(
                        "text-[10px] font-mono",
                        chat.status === "connected" && "text-emerald-600 dark:text-emerald-400",
                        chat.status === "disconnected" && "text-red-500 dark:text-red-400",
                        chat.status === "checking" && "text-amber-600 dark:text-amber-400",
                    )}>
                        {chat.status === "connected"
                            ? (chat.ollamaVersion ? `v${chat.ollamaVersion}` : "connecté")
                            : chat.status === "disconnected" ? "déconnecté" : "…"}
                    </span>
                </div>
            </header>

            {/* Sélecteur de modèle */}
            {chat.status === "connected" && chat.models.length > 1 && (
                <div className="px-4 py-2 border-b border-bridge-500/10 dark:border-bridge-500/20 flex-shrink-0">
                    <Select value={chat.selectedModel} onValueChange={chat.setSelectedModel}>
                        <SelectTrigger className="h-7 text-xs border-bridge-400/30 dark:border-bridge-500/30 bg-bridge-100/50 dark:bg-bridge-800/50 font-mono">
                            <SelectValue placeholder="Choisir un modèle…" />
                        </SelectTrigger>
                        <SelectContent>
                            {chat.models.map((m) => (
                                <SelectItem key={m} value={m} className="text-xs font-mono">{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* États Ollama */}
            {chat.status === "checking" && (
                <div className="flex-1 flex items-center justify-center gap-2.5 text-bridge-500 dark:text-bridge-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Connexion à Ollama…</span>
                </div>
            )}

            {chat.status === "disconnected" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <WifiOff className="w-6 h-6 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-sm font-semibold text-bridge-800 dark:text-bridge-100">Ollama non connecté</p>
                        <p className="text-xs text-bridge-500 dark:text-bridge-400 leading-relaxed">Démarrez Ollama avec :</p>
                    </div>
                    <code className="text-xs bg-bridge-900 dark:bg-bridge-950 text-emerald-400 font-mono px-3 py-2 rounded-lg w-full max-w-[280px] text-left select-all">
                        ollama serve
                    </code>
                    <Button size="sm" variant="outline"
                        className="gap-1.5 h-7 text-xs border-bridge-400/40 hover:border-brand-primary/50 hover:text-brand-primary transition-colors cursor-pointer"
                        onClick={chat.retry}
                    >
                        <RefreshCw className="w-3 h-3" /> Réessayer
                    </Button>
                </div>
            )}

            {/* Zone de messages */}
            {chat.status === "connected" && chat.models.length > 0 && (
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
                    {chat.messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 text-center py-12 flex-1">
                            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-brand-primary" />
                            </div>
                            <p className="text-sm text-bridge-500 dark:text-bridge-400 max-w-[260px] leading-relaxed">
                                Décrivez ce que vous souhaitez créer ou modifier dans le cours.
                            </p>
                        </div>
                    )}
                    {chat.messages.map((msg, i) => (
                        <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                            {msg.role === "assistant" && msg.thinking && (
                                <details className="mb-1.5 group max-w-[85%]">
                                    <summary className="text-xs text-bridge-400 dark:text-bridge-500 cursor-pointer select-none list-none flex items-center gap-1.5 hover:text-bridge-500 dark:hover:text-bridge-400 transition-colors">
                                        <span className="inline-block transition-transform duration-150 group-open:rotate-90">▶</span>
                                        Réflexion
                                    </summary>
                                    <div className="mt-1.5 pl-3 border-l-2 border-bridge-300 dark:border-bridge-600 text-xs leading-relaxed text-bridge-500 dark:text-bridge-400 italic whitespace-pre-wrap max-h-64 overflow-y-auto">
                                        {msg.thinking}
                                    </div>
                                </details>
                            )}
                            <div className={cn(
                                "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                                msg.role === "user"
                                    ? "bg-brand-primary text-brand-light rounded-br-sm"
                                    : "bg-bridge-100 dark:bg-bridge-800 text-bridge-700 dark:text-bridge-300 border border-bridge-400/20 dark:border-bridge-500/25 rounded-bl-sm",
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {chat.loading && (
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

            {/* Zone de saisie */}
            {chat.status === "connected" && chat.models.length > 0 && (
                <div className="flex-shrink-0 border-t border-bridge-500/15 dark:border-bridge-500/20 px-4 py-4 flex gap-3 items-end">
                    <Textarea
                        ref={textareaRef}
                        placeholder="Décrivez une modification… (↵ envoie, Alt+↵ saut de ligne)"
                        value={chat.input}
                        onChange={(e) => chat.setInput(e.target.value)}
                        rows={3}
                        className="text-sm border-bridge-400/30 dark:border-bridge-500/30 bg-bridge-100/50 dark:bg-bridge-800/50 resize-none flex-1"
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        size="icon"
                        onClick={() => void chat.handleSend()}
                        disabled={chat.loading || !chat.input.trim() || !chat.selectedModel}
                        aria-label="Envoyer"
                        className="h-10 w-10 flex-shrink-0 bg-brand-primary hover:bg-brand-accent-dark text-brand-light disabled:opacity-40 mb-px cursor-pointer"
                    >
                        {chat.loading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Send className="w-4 h-4" />
                        }
                    </Button>
                </div>
            )}
        </div>
    );
}
