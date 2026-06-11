"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface InlineTextEditorProps {
    value: string;
    onChange: (next: string) => void;
    multiline?: boolean;
    placeholder?: string;
    className?: string;
    id?: string;
    "aria-label"?: string;
    autoFocus?: boolean;
    onBlur?: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * Éditeur de texte inline du builder. Format I/O : markdown inline (string).
 *
 * V1 : wrap minimal input/textarea — l'admin tape la syntaxe markdown brute,
 *      le rendu live se voit dans le canvas via `renderInline()`.
 *
 * Évolutions possibles sans toucher aux consumers (signature stable) :
 *  - Toolbar (B/I/code/lien) qui wrap la sélection avec `setSelectionRange`
 *  - Raccourcis Ctrl+B / Ctrl+I / Ctrl+K
 *  - Swap pour TipTap + serializer markdown
 */
export function InlineTextEditor({
    value,
    onChange,
    multiline = false,
    placeholder,
    className,
    id,
    "aria-label": ariaLabel,
    autoFocus,
    onBlur,
    onKeyDown,
}: InlineTextEditorProps) {
    if (multiline) {
        return (
            <Textarea
                id={id}
                aria-label={ariaLabel}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className={className}
                autoFocus={autoFocus}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
            />
        );
    }
    return (
        <Input
            id={id}
            aria-label={ariaLabel}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={className}
            autoFocus={autoFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
        />
    );
}
