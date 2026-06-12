"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Sparkles, X, WifiOff, RefreshCw, Send, ExternalLink, PanelRightOpen, PanelRightClose } from "lucide-react";
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
import { useChatSession } from "@/lib/hooks/useChatSession";

interface AiAssistantPanelProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    mode?: "float" | "docked";
    onModeChange?: (mode: "float" | "docked") => void;
}

export function AiAssistantPanel({
    moduleSlug,
    sectionSlug,
    contentType,
    mode = "float",
    onModeChange,
}: AiAssistantPanelProps) {
    const { blocks, setBlocks } = useBuilderStore();
    const [open, setOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const chat = useChatSession({
        moduleSlug, sectionSlug, contentType,
        currentBlocks: blocks,
        onBlocksUpdate: setBlocks,
        enabled: mode === "docked" || open,
    });

    // Recevoir les mises à jour de blocs et les signaux depuis la fenêtre popup
    useEffect(() => {
        if (typeof BroadcastChannel === "undefined") return;
        const channel = new BroadcastChannel("builder-blocks");
        channel.onmessage = (e: MessageEvent<{ type: string; blocks?: Block[] }>) => {
            if (e.data.type === "blocks-updated" && e.data.blocks) setBlocks(e.data.blocks);
            if (e.data.type === "panel-focus") setOpen(true);
        };
        return () => channel.close();
    }, [setBlocks]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat.messages, chat.loading]);

    function handlePopOut() {
        const url = `/admin/chat/${moduleSlug}/${sectionSlug}/${contentType}`;
        window.open(url, "ai-chat", "width=440,height=720,menubar=no,toolbar=no,location=no,status=no");
        setOpen(false);
        if (mode === "docked") onModeChange?.("float");
    }

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

    // ── Contenu partagé (messages + input) ──────────────────────────────────────
    const chatBody = (
        <>
            {chat.status === "checking" && (
                <div className="flex-1 flex items-center justify-center gap-2.5 py-12 text-bridge-500 dark:text-bridge-400">
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
                        <p className="text-xs text-bridge-500 dark:text-bridge-400 leading-relaxed">Démarrez Ollama sur ce serveur avec :</p>
                    </div>
                    <code className="text-xs bg-bridge-900 dark:bg-bridge-950 text-emerald-400 font-mono px-3 py-2 rounded-lg w-full text-left select-all">
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

            {chat.status === "connected" && chat.models.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-sm font-semibold text-bridge-800 dark:text-bridge-100">Aucun modèle installé</p>
                        <p className="text-xs text-bridge-500 dark:text-bridge-400 leading-relaxed">Téléchargez un modèle avec :</p>
                    </div>
                    <code className="text-xs bg-bridge-900 dark:bg-bridge-950 text-emerald-400 font-mono px-3 py-2 rounded-lg w-full text-left select-all">
                        ollama pull llama3.2
                    </code>
                    <Button size="sm" variant="outline"
                        className="gap-1.5 h-7 text-xs border-bridge-400/40 hover:border-brand-primary/50 hover:text-brand-primary transition-colors cursor-pointer"
                        onClick={chat.retry}
                    >
                        <RefreshCw className="w-3 h-3" /> Actualiser
                    </Button>
                </div>
            )}

            {chat.status === "connected" && chat.models.length > 0 && (
                <>
                    {/* Sélecteur de modèle — affiché uniquement si plusieurs modèles */}
                    {chat.models.length > 1 && (
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

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
                        {chat.messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center gap-2 text-center py-8 flex-1">
                                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-brand-primary" />
                                </div>
                                <p className="text-xs text-bridge-500 dark:text-bridge-400 max-w-[220px] leading-relaxed">
                                    Décrivez ce que vous souhaitez créer ou modifier dans le cours.
                                </p>
                            </div>
                        )}
                        {chat.messages.map((msg, i) => (
                            <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                                {msg.role === "assistant" && msg.thinking && (
                                    <details className="mb-1 group max-w-[82%]">
                                        <summary className="text-[10px] text-bridge-400 dark:text-bridge-500 cursor-pointer select-none list-none flex items-center gap-1 hover:text-bridge-500 dark:hover:text-bridge-400 transition-colors">
                                            <span className="inline-block transition-transform duration-150 group-open:rotate-90">▶</span>
                                            Réflexion
                                        </summary>
                                        <div className="mt-1 pl-2.5 border-l-2 border-bridge-300 dark:border-bridge-600 text-[10px] leading-relaxed text-bridge-500 dark:text-bridge-400 italic whitespace-pre-wrap max-h-48 overflow-y-auto">
                                            {msg.thinking}
                                        </div>
                                    </details>
                                )}
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

                    {/* Input */}
                    <div className="flex-shrink-0 border-t border-bridge-500/15 dark:border-bridge-500/20 px-3 py-3 flex gap-2 items-end">
                        <Textarea
                            ref={textareaRef}
                            placeholder="Décrivez une modification… (↵ envoie, Alt+↵ saut de ligne)"
                            value={chat.input}
                            onChange={(e) => chat.setInput(e.target.value)}
                            rows={2}
                            className="text-xs border-bridge-400/30 dark:border-bridge-500/30 bg-bridge-100/50 dark:bg-bridge-800/50 resize-none flex-1"
                            onKeyDown={handleKeyDown}
                        />
                        <Button
                            size="icon"
                            onClick={() => void chat.handleSend()}
                            disabled={chat.loading || !chat.input.trim() || !chat.selectedModel}
                            aria-label="Envoyer"
                            className="h-8 w-8 flex-shrink-0 bg-brand-primary hover:bg-brand-accent-dark text-brand-light disabled:opacity-40 mb-px cursor-pointer"
                        >
                            {chat.loading
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Send className="w-3.5 h-3.5" />
                            }
                        </Button>
                    </div>
                </>
            )}
        </>
    );

    // ── Mode docked : sidebar ancrée ─────────────────────────────────────────────
    if (mode === "docked") {
        return (
            <div className="w-[360px] h-full flex flex-col border-l border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-bridge-500/20 dark:border-bridge-500/35 flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary flex-1 min-w-0 truncate">
                        Assistant IA local
                    </span>
                    <OllamaIndicator status={chat.status} version={chat.ollamaVersion} />
                    <button
                        aria-label="Ouvrir dans une fenêtre séparée"
                        onClick={handlePopOut}
                        className="text-bridge-500 dark:text-bridge-400 hover:text-brand-primary transition-colors cursor-pointer flex-shrink-0 ml-1"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                        aria-label="Détacher le panel"
                        onClick={() => onModeChange?.("float")}
                        className="text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200 transition-colors cursor-pointer flex-shrink-0"
                    >
                        <PanelRightClose className="w-3.5 h-3.5" />
                    </button>
                </div>
                {chatBody}
            </div>
        );
    }

    // ── Mode float : FAB + panel flottant ─────────────────────────────────────────
    return (
        <>
            {/* FAB */}
            <button
                aria-label={open ? "Fermer l'assistant IA" : "Ouvrir l'assistant IA local"}
                onClick={open ? () => setOpen(false) : () => setOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 rounded-full w-11 h-11 flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer",
                    open
                        ? "bg-brand-primary text-brand-light hover:bg-brand-accent-dark"
                        : "bg-bridge-100 dark:bg-bridge-800 border border-bridge-400/40 dark:border-bridge-500/40 text-bridge-600 dark:text-bridge-300 hover:border-brand-primary/50 hover:text-brand-primary",
                )}
            >
                {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </button>

            {/* Panel flottant */}
            {open && (
                <div className="fixed bottom-20 right-6 z-50 w-[380px] max-h-[600px] bg-bridge-50 dark:bg-bridge-900 border border-bridge-500/20 dark:border-bridge-500/35 rounded-xl shadow-[0_12px_40px_-12px_rgba(147,97,58,0.4)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-bridge-500/20 dark:border-bridge-500/35 flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary flex-1 min-w-0 truncate">
                            Assistant IA local
                        </span>
                        <OllamaIndicator status={chat.status} version={chat.ollamaVersion} />
                        <button
                            aria-label="Ancrer le panel"
                            onClick={() => { onModeChange?.("docked"); setOpen(false); }}
                            className="text-bridge-500 dark:text-bridge-400 hover:text-brand-primary transition-colors cursor-pointer flex-shrink-0 ml-1"
                            title="Ancrer en sidebar"
                        >
                            <PanelRightOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                            aria-label="Ouvrir dans une fenêtre séparée"
                            onClick={handlePopOut}
                            className="text-bridge-500 dark:text-bridge-400 hover:text-brand-primary transition-colors cursor-pointer flex-shrink-0"
                            title="Fenêtre séparée"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                            aria-label="Fermer"
                            onClick={() => setOpen(false)}
                            className="text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200 transition-colors cursor-pointer flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {chatBody}
                </div>
            )}
        </>
    );
}

function OllamaIndicator({ status, version }: { status: string; version: string | null }) {
    return (
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
                    ? (version ? `v${version}` : "connecté")
                    : status === "disconnected" ? "déconnecté" : "…"}
            </span>
        </div>
    );
}
