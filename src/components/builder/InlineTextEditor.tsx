"use client";

import React, { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { applyInlineMarker, type InlineMarker } from "@/lib/markdownToolbar";

export interface InlineTextEditorHandle {
    applyMarker: (marker: InlineMarker) => void;
    focus: () => void;
}

interface InlineTextEditorProps {
    /** Valeur markdown brute initiale. */
    value: string;
    /** Auto-save : appelé au blur (ou Ctrl+Entrée) avec la nouvelle valeur. */
    onCommit: (next: string) => void;
    /** Escape : annule, restaure la valeur d'origine. */
    onCancel: () => void;
    ariaLabel: string;
    className?: string;
}

/**
 * Éditeur de source markdown inline (option A). Un <textarea> auto-grandissant
 * lié à la chaîne brute ; aucune transformation DOM→markdown.
 */
export const InlineTextEditor = forwardRef<InlineTextEditorHandle, InlineTextEditorProps>(
    function InlineTextEditor({ value, onCommit, onCancel, ariaLabel, className }, ref) {
        const taRef = useRef<HTMLTextAreaElement>(null);
        const [draft, setDraft] = useState(value);

        // Auto-hauteur
        useLayoutEffect(() => {
            const ta = taRef.current;
            if (!ta) return;
            ta.style.height = "auto";
            ta.style.height = `${ta.scrollHeight}px`;
        }, [draft]);

        useImperativeHandle(ref, () => ({
            applyMarker(marker) {
                const ta = taRef.current;
                if (!ta) return;
                const { text, selStart, selEnd } = applyInlineMarker(
                    draft,
                    ta.selectionStart,
                    ta.selectionEnd,
                    marker,
                );
                setDraft(text);
                requestAnimationFrame(() => {
                    ta.focus();
                    ta.setSelectionRange(selStart, selEnd);
                });
            },
            focus() {
                taRef.current?.focus();
            },
        }));

        return (
            <textarea
                ref={taRef}
                aria-label={ariaLabel}
                value={draft}
                autoFocus
                rows={1}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => onCommit(draft)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        e.preventDefault();
                        onCancel();
                    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        onCommit(draft);
                    }
                }}
                className={
                    className ??
                    "w-full resize-none overflow-hidden bg-transparent outline-none focus-visible:ring-0"
                }
            />
        );
    },
);
