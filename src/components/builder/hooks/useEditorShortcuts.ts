"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
    onSave: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onInsert: () => void;
    onCollapseAll: () => void;
    onExpandAll: () => void;
    onDelete: () => void;
    onEscape: () => void;
    onDuplicate: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onSelectNext: () => void;
    onSelectPrev: () => void;
}

function isEditingText(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return true;
    if (el instanceof HTMLElement && el.isContentEditable) return true;
    return false;
}

export function useEditorShortcuts({
    onSave, onUndo, onRedo, onInsert,
    onCollapseAll, onExpandAll,
    onDelete, onEscape, onDuplicate,
    onMoveUp, onMoveDown,
    onSelectNext, onSelectPrev,
}: ShortcutHandlers): void {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const ctrl = e.ctrlKey || e.metaKey;
            const editing = isEditingText();

            // Escape — toujours actif
            if (e.key === "Escape") {
                onEscape();
                return;
            }

            // Raccourcis Ctrl — toujours actifs (sauf conflit navigateur)
            if (ctrl) {
                switch (e.key) {
                    case "s": e.preventDefault(); onSave(); return;
                    case "z": e.preventDefault(); onUndo(); return;
                    case "y": e.preventDefault(); onRedo(); return;
                    case "i": e.preventDefault(); onInsert(); return;
                    case "d": e.preventDefault(); onDuplicate(); return;
                    case "-": e.preventDefault(); onCollapseAll(); return;
                    case "=":
                    case "+": e.preventDefault(); onExpandAll(); return;
                    case "ArrowUp": e.preventDefault(); onMoveUp(); return;
                    case "ArrowDown": e.preventDefault(); onMoveDown(); return;
                }
                return;
            }

            // Raccourcis sans Ctrl — inactifs si on est dans un champ
            if (editing) return;

            switch (e.key) {
                case "Delete":
                case "Backspace":
                    e.preventDefault();
                    onDelete();
                    break;
                case "Tab":
                    e.preventDefault();
                    if (e.shiftKey) onSelectPrev();
                    else onSelectNext();
                    break;
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onSave, onUndo, onRedo, onInsert, onCollapseAll, onExpandAll,
        onDelete, onEscape, onDuplicate, onMoveUp, onMoveDown,
        onSelectNext, onSelectPrev]);
}
