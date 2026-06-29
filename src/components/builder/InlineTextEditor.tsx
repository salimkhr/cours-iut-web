"use client";

import React, { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, useCallback } from "react";
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
        // draftRef keeps applyMarker in sync with draft without requiring
        // useImperativeHandle to re-run on every keystroke (which would call
        // the callback ref with null+handle every render → infinite loop).
        const draftRef = useRef(draft);

        // Auto-hauteur
        useLayoutEffect(() => {
            const ta = taRef.current;
            if (!ta) return;
            ta.style.height = "auto";
            ta.style.height = `${ta.scrollHeight}px`;
        }, [draft]);

        const updateDraft = useCallback((text: string) => {
            draftRef.current = text;
            setDraft(text);
        }, []);

        // deps: [] → handle object est créé une seule fois ; stable entre les
        // renders → pas de cleanup/setup répété du callback ref côté parent.
        useImperativeHandle(ref, () => ({
            applyMarker(marker) {
                const ta = taRef.current;
                if (!ta) return;
                const { text, selStart, selEnd } = applyInlineMarker(
                    draftRef.current,
                    ta.selectionStart,
                    ta.selectionEnd,
                    marker,
                );
                updateDraft(text);
                requestAnimationFrame(() => {
                    ta.focus();
                    ta.setSelectionRange(selStart, selEnd);
                });
            },
            focus() {
                taRef.current?.focus();
            },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }), []);

        return (
            <textarea
                ref={taRef}
                aria-label={ariaLabel}
                value={draft}
                autoFocus
                rows={1}
                onChange={(e) => updateDraft(e.target.value)}
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
