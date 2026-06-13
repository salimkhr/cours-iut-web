"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useBuilderStore } from "@/lib/store/builderStore";
import { EditorToolbar } from "@/components/builder/EditorToolbar";
import { EditorTree } from "@/components/builder/EditorTree";
import { EditorPreview } from "@/components/builder/EditorPreview";
import { BlockInsertDialog } from "@/components/builder/BlockInsertDialog";
import { useEditorShortcuts } from "@/components/builder/hooks/useEditorShortcuts";
import type { Block } from "@/types/CourseContent";

interface BuilderPageProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    moduleTitle: string;
    sectionTitle: string;
    initialBlocks: Block[];
    source: "file" | "db";
}

export function BuilderPage({
    moduleSlug,
    sectionSlug,
    contentType,
    moduleTitle,
    sectionTitle,
    initialBlocks,
    source,
}: BuilderPageProps) {
    const setBlocks = useBuilderStore((s) => s.setBlocks);
    const isDirty = useBuilderStore((s) => s.isDirty);
    const markSaved = useBuilderStore((s) => s.markSaved);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);

    const [saving, setSaving] = useState(false);
    const [insertDialogOpen, setInsertDialogOpen] = useState(false);
    const previewRef = useRef<{ reload: () => void } | null>(null);

    // Initialiser les blocs au montage
    useEffect(() => {
        setBlocks(initialBlocks);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Avertir avant de quitter si modifications non sauvegardées
    useEffect(() => {
        if (!isDirty) return;
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            e.preventDefault();
            e.returnValue = "";
        }
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const handleSave = useCallback(async () => {
        if (!isDirty || saving) return;
        setSaving(true);
        try {
            const blocks = useBuilderStore.getState().blocks;
            const res = await fetch(
                `/api/admin/content/${moduleSlug}/${sectionSlug}/${contentType}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ blocks }),
                }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => null) as { error?: string } | null;
                throw new Error(body?.error ?? `HTTP ${res.status}`);
            }
            markSaved();
            toast.success("Contenu sauvegardé.");
            previewRef.current?.reload();
        } catch (err) {
            toast.error("Échec de la sauvegarde", {
                description: err instanceof Error ? err.message : "Erreur inconnue",
            });
        } finally {
            setSaving(false);
        }
    }, [isDirty, saving, moduleSlug, sectionSlug, contentType, markSaved]);

    useEditorShortcuts({
        onSave: handleSave,
        onUndo: undo,
        onRedo: redo,
        onInsert: () => setInsertDialogOpen(true),
    });

    return (
        <div className="flex flex-col h-[calc(100dvh-4rem)] overflow-hidden">
            <EditorToolbar
                moduleTitle={moduleTitle}
                sectionTitle={sectionTitle}
                contentType={contentType}
                source={source}
                saving={saving}
                onSave={() => void handleSave()}
            />

            <div className="flex flex-1 min-h-0">
                {/* Panneau gauche — arbre de blocs */}
                <div className="w-[420px] min-w-[280px] max-w-[600px] flex flex-col border-r border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50/40 dark:bg-slate-900/40">
                    <EditorTree onInsertAtRoot={() => setInsertDialogOpen(true)} />
                </div>

                {/* Panneau droit — prévisualisation */}
                <div className="flex-1 min-w-0">
                    <EditorPreview
                        ref={previewRef}
                        moduleSlug={moduleSlug}
                        sectionSlug={sectionSlug}
                        contentType={contentType}
                    />
                </div>
            </div>

            {/* Dialog d'insertion globale (Ctrl+I) */}
            <BlockInsertDialog
                open={insertDialogOpen}
                onClose={() => setInsertDialogOpen(false)}
                parentId={null}
                index={Number.MAX_SAFE_INTEGER}
            />
        </div>
    );
}
