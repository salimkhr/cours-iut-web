"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
    onSave: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onInsert: () => void;
}

export function useEditorShortcuts({ onSave, onUndo, onRedo, onInsert }: ShortcutHandlers): void {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const ctrl = e.ctrlKey || e.metaKey;
            if (!ctrl) return;

            switch (e.key.toLowerCase()) {
                case "s":
                    e.preventDefault();
                    onSave();
                    break;
                case "z":
                    e.preventDefault();
                    onUndo();
                    break;
                case "y":
                    e.preventDefault();
                    onRedo();
                    break;
                case "i":
                    e.preventDefault();
                    onInsert();
                    break;
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onSave, onUndo, onRedo, onInsert]);
}
