"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Monaco n'est pas SSR-safe → import client only.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorModalProps {
    open: boolean;
    initialValue: string;
    language: string;
    onClose: () => void;
    onSave: (value: string) => void;
}

/**
 * Monaco plein écran dans un Dialog radix (porté sur document.body → échappe
 * au stacking context du ZoomedSlide, cf. spec §6).
 */
export function CodeEditorModal({ open, initialValue, language, onClose, onSave }: CodeEditorModalProps) {
    const [value, setValue] = useState(initialValue);

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) {
                    onSave(value);
                    onClose();
                }
            }}
        >
            <DialogContent className="h-[85vh] w-[90vw] max-w-none gap-2 p-4 sm:max-w-none">
                <DialogHeader>
                    <DialogTitle className="text-sm">Éditer le code — {language}</DialogTitle>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-hidden rounded border border-slate-200 dark:border-slate-700">
                    <MonacoEditor
                        height="100%"
                        defaultLanguage={language}
                        defaultValue={initialValue}
                        onChange={(v) => setValue(v ?? "")}
                        options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
