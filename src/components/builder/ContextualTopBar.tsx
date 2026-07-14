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
    onEditImage?: (blockId: string) => void;
    /** Handle de l'éditeur inline actuellement focalisé (null sinon). */
    activeEditor: InlineTextEditorHandle | null;
    /** Compteur slides (mode slide). */
    slidePosition?: { index: number; total: number };
}

const TEXT_TYPES = new Set(["text", "slide-text", "heading", "list-item", "slide-list-item"]);

function IconBtn({ label, onClick, onMouseDown, disabled, children }: { label: string; onClick: () => void; onMouseDown?: React.MouseEventHandler<HTMLButtonElement>; disabled?: boolean; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            onMouseDown={onMouseDown}
            disabled={disabled}
            className="inline-flex size-11 items-center justify-center rounded-md text-brand-dark/70 hover:bg-bridge-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color,#C2410C)] disabled:pointer-events-none disabled:opacity-30 dark:text-bridge-200 dark:hover:bg-bridge-800"
        >
            {children}
        </button>
    );
}

export function ContextualTopBar({
    mode, onInsert, onOpenBackground, onOpenCodeModal, onEditImage, activeEditor, slidePosition,
}: ContextualTopBarProps) {
    const selectedId = useBuilderStore((s) => s.selectedId);
    const blocks = useBuilderStore((s) => s.blocks);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const canUndo = useBuilderStore((s) => s._history.length > 0);
    const canRedo = useBuilderStore((s) => s._future.length > 0);
    const updateBlock = useBuilderStore((s) => s.updateBlock);
    const moduleSlug = useBuilderStore((s) => s.moduleSlug);

    const selected = selectedId ? findBlock(blocks, selectedId) : null;
    const def = selected ? getBlockDefinition(selected.type) : null;

    const mark = (m: InlineMarker) => activeEditor?.applyMarker(m);

    const renderContextZone = () => {
        if (!selected || !def) return null;
        const t = selected.type;

        if (TEXT_TYPES.has(t)) {
            const noBlur = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();
            return (
                <>
                    <IconBtn label="Gras" onClick={() => mark("bold")} onMouseDown={noBlur}><Bold className="size-4" /></IconBtn>
                    <IconBtn label="Italique" onClick={() => mark("italic")} onMouseDown={noBlur}><Italic className="size-4" /></IconBtn>
                    <IconBtn label="Code inline" onClick={() => mark("code")} onMouseDown={noBlur}><Code className="size-4" /></IconBtn>
                    <IconBtn label="Lien" onClick={() => mark("link")} onMouseDown={noBlur}><Link className="size-4" /></IconBtn>
                    {t === "heading" && (
                        <>
                            <IconBtn label="Titre niveau 2" onClick={() => updateBlock(selected.id, { level: 2 })} onMouseDown={noBlur}><Heading2 className="size-4" /></IconBtn>
                            <IconBtn label="Titre niveau 3" onClick={() => updateBlock(selected.id, { level: 3 })} onMouseDown={noBlur}><Heading3 className="size-4" /></IconBtn>
                        </>
                    )}
                </>
            );
        }

        if (t === "code" || t === "slide-code") {
            return (
                <>
                    <span className="inline-flex items-center gap-1 px-2 text-xs text-bridge-500"><Code2 className="size-4" /> {String(selected.props.language ?? "javascript")}</span>
                    <span className="inline-flex items-center gap-1 px-2 text-xs text-bridge-500"><Highlighter className="size-4" /> {String(selected.props.highlight ?? "—")}</span>
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
            return <IconBtn label="Remplacer l'image" onClick={() => onEditImage?.(selected.id)}><ImagePlus className="size-4" /></IconBtn>;
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
        <div className="z-20 flex items-center gap-1 border-b border-bridge-200 bg-bridge-50 px-3 py-1.5 dark:border-bridge-700 dark:bg-bridge-900">
            {/* Zone globale */}
            <button
                type="button"
                onClick={onInsert}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-brand-primary px-3 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color)] focus-visible:ring-offset-1"
                style={moduleSlug ? { backgroundColor: "var(--mod-color)" } : undefined}
            >
                <Plus className="size-4" /> Bloc
            </button>

            {mode === "slide" && onOpenBackground && (
                <IconBtn label="Fond de la slide" onClick={onOpenBackground}><Palette className="size-4" /></IconBtn>
            )}

            <IconBtn label="Annuler (Ctrl+Z)" onClick={undo} disabled={!canUndo}><Undo2 className="size-4" /></IconBtn>
            <IconBtn label="Rétablir (Ctrl+Y)" onClick={redo} disabled={!canRedo}><Redo2 className="size-4" /></IconBtn>

            {contextZone && <div className="mx-1 h-6 w-px bg-bridge-300 dark:bg-bridge-600" />}
            {contextZone}

            {mode === "slide" && slidePosition && (
                <span className="ml-auto text-xs font-semibold text-bridge-400">
                    {slidePosition.index + 1} / {slidePosition.total}
                </span>
            )}
        </div>
    );
}
