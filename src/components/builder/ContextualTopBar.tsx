"use client";

import React from "react";
import {
    Plus, Undo2, Redo2, Bold, Italic, Code, Link, Code2, Highlighter,
    Maximize2, ImagePlus, Heading2, Heading3, List, ListOrdered,
    Info, AlertTriangle, Lightbulb, BookMarked, Palette,
} from "lucide-react";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";
import { getBlockDefinition } from "@/lib/blockRegistry";
import type { InlineTextEditorHandle } from "@/components/builder/InlineTextEditor";
import type { InlineMarker } from "@/lib/markdownToolbar";

interface ContextualTopBarProps {
    mode: "slide" | "course";
    onInsert: () => void;
    onOpenBackground?: () => void;
    onOpenCodeModal?: (blockId: string) => void;
    /** Handle de l'éditeur inline actuellement focalisé (null sinon). */
    activeEditor: InlineTextEditorHandle | null;
    /** Compteur slides (mode slide). */
    slidePosition?: { index: number; total: number };
}

const TEXT_TYPES = new Set(["text", "slide-text", "heading", "list-item", "slide-list-item"]);

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className="inline-flex size-11 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800"
        >
            {children}
        </button>
    );
}

export function ContextualTopBar({
    mode, onInsert, onOpenBackground, onOpenCodeModal, activeEditor, slidePosition,
}: ContextualTopBarProps) {
    const selectedId = useBuilderStore((s) => s.selectedId);
    const blocks = useBuilderStore((s) => s.blocks);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const updateBlock = useBuilderStore((s) => s.updateBlock);

    const selected = selectedId ? findBlock(blocks, selectedId) : null;
    const def = selected ? getBlockDefinition(selected.type) : null;

    const mark = (m: InlineMarker) => activeEditor?.applyMarker(m);

    const renderContextZone = () => {
        if (!selected || !def) return null;
        const t = selected.type;

        if (TEXT_TYPES.has(t)) {
            return (
                <>
                    <IconBtn label="Gras" onClick={() => mark("bold")}><Bold className="size-4" /></IconBtn>
                    <IconBtn label="Italique" onClick={() => mark("italic")}><Italic className="size-4" /></IconBtn>
                    <IconBtn label="Code inline" onClick={() => mark("code")}><Code className="size-4" /></IconBtn>
                    <IconBtn label="Lien" onClick={() => mark("link")}><Link className="size-4" /></IconBtn>
                    {t === "heading" && (
                        <>
                            <IconBtn label="Titre niveau 2" onClick={() => updateBlock(selected.id, { level: 2 })}><Heading2 className="size-4" /></IconBtn>
                            <IconBtn label="Titre niveau 3" onClick={() => updateBlock(selected.id, { level: 3 })}><Heading3 className="size-4" /></IconBtn>
                        </>
                    )}
                </>
            );
        }

        if (t === "code" || t === "slide-code") {
            return (
                <>
                    <span className="inline-flex items-center gap-1 px-2 text-xs text-slate-500"><Code2 className="size-4" /> {String(selected.props.language ?? "javascript")}</span>
                    <span className="inline-flex items-center gap-1 px-2 text-xs text-slate-500"><Highlighter className="size-4" /> {String(selected.props.highlight ?? "—")}</span>
                    <IconBtn label="Éditeur plein écran" onClick={() => onOpenCodeModal?.(selected.id)}><Maximize2 className="size-4" /></IconBtn>
                </>
            );
        }

        if (t === "list" || t === "slide-list") {
            return (
                <>
                    <IconBtn label="Liste à puces" onClick={() => updateBlock(selected.id, { ordered: false })}><List className="size-4" /></IconBtn>
                    <IconBtn label="Liste numérotée" onClick={() => updateBlock(selected.id, { ordered: true })}><ListOrdered className="size-4" /></IconBtn>
                </>
            );
        }

        if (t === "image-card") {
            return <IconBtn label="Remplacer l'image" onClick={() => onOpenCodeModal?.(selected.id)}><ImagePlus className="size-4" /></IconBtn>;
        }

        if (t === "callout") {
            const set = (v: string) => updateBlock(selected.id, { variant: v });
            return (
                <>
                    <IconBtn label="Info" onClick={() => set("info")}><Info className="size-4" /></IconBtn>
                    <IconBtn label="Attention" onClick={() => set("warning")}><AlertTriangle className="size-4" /></IconBtn>
                    <IconBtn label="Astuce" onClick={() => set("tip")}><Lightbulb className="size-4" /></IconBtn>
                    <IconBtn label="Remarque" onClick={() => set("note")}><BookMarked className="size-4" /></IconBtn>
                </>
            );
        }

        return null;
    };

    const contextZone = renderContextZone();

    return (
        <div className="z-20 flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            {/* Zone globale */}
            <button
                type="button"
                onClick={onInsert}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
                <Plus className="size-4" /> Bloc
            </button>

            {mode === "slide" && onOpenBackground && (
                <IconBtn label="Fond de la slide" onClick={onOpenBackground}><Palette className="size-4" /></IconBtn>
            )}

            <IconBtn label="Annuler" onClick={undo}><Undo2 className="size-4" /></IconBtn>
            <IconBtn label="Rétablir" onClick={redo}><Redo2 className="size-4" /></IconBtn>

            {contextZone && <div className="mx-1 h-6 w-px bg-slate-300 dark:bg-slate-600" />}
            {contextZone}

            {mode === "slide" && slidePosition && (
                <span className="ml-auto text-xs font-semibold text-slate-400">
                    {slidePosition.index + 1} / {slidePosition.total}
                </span>
            )}
        </div>
    );
}
