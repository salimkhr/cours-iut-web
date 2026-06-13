"use client";

import { useImperativeHandle, forwardRef, useRef } from "react";

interface EditorPreviewRef {
    reload: () => void;
}

interface EditorPreviewProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export const EditorPreview = forwardRef<EditorPreviewRef, EditorPreviewProps>(
    function EditorPreview({ moduleSlug, sectionSlug, contentType }, ref) {
        const iframeRef = useRef<HTMLIFrameElement>(null);

        useImperativeHandle(ref, () => ({
            reload() {
                if (iframeRef.current) {
                    iframeRef.current.src = iframeRef.current.src;
                }
            },
        }));

        const previewUrl = `/${moduleSlug}/${sectionSlug}/${contentType}`;

        return (
            <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-300/40 dark:border-slate-600/30">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-300/30 dark:border-slate-600/20 bg-slate-50/80 dark:bg-slate-900/80">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500">
                        Aperçu
                    </span>
                    <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors ml-auto"
                    >
                        Ouvrir ↗
                    </a>
                </div>
                <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    title="Aperçu du contenu"
                    className="flex-1 w-full border-0"
                />
            </div>
        );
    }
);
