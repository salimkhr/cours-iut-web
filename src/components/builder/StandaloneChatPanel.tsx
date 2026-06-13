"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, Sparkles, WifiOff, RefreshCw, Send, PanelRightOpen, Copy, Check, Plus, Pencil, Trash2 } from "lucide-react";
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
    const [elapsedSecs, setElapsedSecs] = useState(0);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const broadcastRef = useRef<BroadcastChannel | null>(null);
    const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        if (!chat.loading) return;
        let count = 0;
        const resetTimer = setTimeout(() => setElapsedSecs(0), 0);
        timerRef.current = setInterval(() => setElapsedSecs(++count), 1000);
        return () => {
            clearTimeout(resetTimer);
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        };
    }, [chat.loading]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat.messages, chat.loading]);

    async function handleCopy(content: string, idx: number) {
        await navigator.clipboard.writeText(content);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
    }

    function handleClearClick() {
        if (chat.confirmClear) {
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            void chat.clearHistory();
        } else {
            chat.setConfirmClear(true);
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            confirmTimeoutRef.current = setTimeout(() => chat.setConfirmClear(false), 2500);
        }
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
                {chat.messages.length > 0 && !chat.historyLoading && (
                    <button
                        aria-label={chat.confirmClear ? "Confirmer la suppression" : "Vider la conversation"}
                        title={chat.confirmClear ? "Cliquez pour confirmer" : "Vider la conversation"}
                        onClick={handleClearClick}
                        className={cn(
                            "flex-shrink-0 transition-colors duration-200 cursor-pointer",
                            chat.confirmClear
                                ? "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                                : "text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200",
                        )}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
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
                    {chat.historyLoading ? (
                        <div className="flex flex-col gap-3 px-1 py-2 w-full">
                            <div className="self-end h-9 rounded-xl bg-bridge-200 dark:bg-bridge-700 animate-pulse rounded-br-sm" style={{ width: "60%" }} />
                            <div className="self-start h-14 rounded-xl bg-bridge-200 dark:bg-bridge-700 animate-pulse rounded-bl-sm" style={{ width: "80%" }} />
                            <div className="self-end h-9 rounded-xl bg-bridge-200 dark:bg-bridge-700 animate-pulse rounded-br-sm" style={{ width: "55%" }} />
                        </div>
                    ) : chat.messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 text-center py-12 flex-1">
                            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-brand-primary" />
                            </div>
                            <p className="text-sm text-bridge-500 dark:text-bridge-400 max-w-[260px] leading-relaxed">
                                Décrivez ce que vous souhaitez créer ou modifier dans le cours.
                            </p>
                        </div>
                    ) : null}
                    {chat.messages.map((msg, i) => (
                        <div key={i} className={cn("flex flex-col group", msg.role === "user" ? "items-end" : "items-start")}>
                            {msg.role === "assistant" && msg.thinking && (
                                <details className="mb-1.5 max-w-[85%]">
                                    <summary className="text-xs text-bridge-400 dark:text-bridge-500 cursor-pointer select-none list-none flex items-center gap-1.5 hover:text-bridge-500 dark:hover:text-bridge-400 transition-colors">
                                        <span className="inline-block transition-transform duration-150 [details[open]_&]:rotate-90">▶</span>
                                        Réflexion
                                    </summary>
                                    <div className="mt-1.5 pl-3 border-l-2 border-bridge-300 dark:border-bridge-600 text-xs leading-relaxed text-bridge-500 dark:text-bridge-400 italic whitespace-pre-wrap max-h-64 overflow-y-auto">
                                        {msg.thinking}
                                    </div>
                                </details>
                            )}
                            {msg.role === "assistant" && msg.toolActions && msg.toolActions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2 max-w-[85%]">
                                    {msg.toolActions.map((action, ai) => (
                                        <ToolActionPill key={ai} name={action.name} count={action.count} />
                                    ))}
                                </div>
                            )}
                            <div className={cn(
                                "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                                msg.role === "user"
                                    ? "bg-brand-primary text-brand-light rounded-br-sm"
                                    : "bg-bridge-100 dark:bg-bridge-800 text-bridge-700 dark:text-bridge-300 border border-bridge-400/20 dark:border-bridge-500/25 rounded-bl-sm",
                            )}>
                                {msg.content}
                            </div>
                            <div className={cn("flex items-center gap-1.5 mt-0.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                                <span className="text-xs text-bridge-400 dark:text-bridge-500 font-mono tabular-nums">
                                    {formatTime(msg.timestamp)}
                                </span>
                                <button
                                    onClick={() => void handleCopy(msg.content, i)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer text-bridge-400 dark:text-bridge-500 hover:text-bridge-600 dark:hover:text-bridge-300"
                                    aria-label="Copier le message"
                                >
                                    {copiedIdx === i
                                        ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        : <Copy className="w-3.5 h-3.5" />
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                    {chat.loading && (
                        <div className="flex justify-start">
                            <div className="bg-bridge-100 dark:bg-bridge-800 border border-bridge-400/20 dark:border-bridge-500/25 rounded-xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-bridge-400 dark:bg-bridge-500 rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 bg-bridge-400 dark:bg-bridge-500 rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 bg-bridge-400 dark:bg-bridge-500 rounded-full animate-bounce [animation-delay:300ms]" />
                                {elapsedSecs > 0 && (
                                    <span className="text-xs text-bridge-400 dark:text-bridge-500 font-mono tabular-nums ml-0.5">{elapsedSecs}s</span>
                                )}
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
                        disabled={chat.loading || chat.historyLoading || !chat.input.trim() || !chat.selectedModel}
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

function formatTime(date: Date): string {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

type ToolPillConfig = { bg: string; text: string; icon: React.ReactNode; label: string };

const TOOL_PILL: Record<string, ToolPillConfig> = {
    insert_block:      { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", icon: <Plus className="w-3 h-3" />,   label: "Inséré" },
    edit_block:        { bg: "bg-amber-100 dark:bg-amber-900/30",     text: "text-amber-700 dark:text-amber-300",    icon: <Pencil className="w-3 h-3" />,  label: "Modifié" },
    delete_block:      { bg: "bg-red-100 dark:bg-red-900/30",         text: "text-red-700 dark:text-red-300",        icon: <Trash2 className="w-3 h-3" />,  label: "Supprimé" },
    delete_all_blocks: { bg: "bg-red-100 dark:bg-red-900/30",         text: "text-red-700 dark:text-red-300",        icon: <Trash2 className="w-3 h-3" />,  label: "Tout effacé" },
};

function ToolActionPill({ name, count }: { name: string; count: number }) {
    const cfg = TOOL_PILL[name] ?? { bg: "bg-bridge-100 dark:bg-bridge-800", text: "text-bridge-600 dark:text-bridge-400", icon: null, label: name };
    return (
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.bg, cfg.text)}>
            {cfg.icon}
            {cfg.label}{count > 1 ? ` ×${count}` : ""}
        </span>
    );
}
