"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock, findParent, findAllIds } from "@/lib/blockTreeUtils";
import { isContainer } from "@/lib/blockSchemas";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { EditorToolbar } from "@/components/builder/EditorToolbar";
import { EditorTree } from "@/components/builder/EditorTree";
import { EditorPreview } from "@/components/builder/EditorPreview";
import { BlockInsertDialog } from "@/components/builder/BlockInsertDialog";
import { useEditorShortcuts } from "@/components/builder/hooks/useEditorShortcuts";
import type { Block } from "@/types/CourseContent";

interface ApiValidationDetail { path: string; message: string }
interface ApiErrorBody { error?: string; details?: ApiValidationDetail[] }

function resolvePathToBlock(blocks: Block[], path: string): Block | null {
    const indices = [...path.matchAll(/\[(\d+)\]/g)].map((m) => parseInt(m[1], 10));
    let current: Block[] = blocks;
    let block: Block | null = null;
    for (const idx of indices) {
        if (!current || idx >= current.length) return null;
        block = current[idx];
        current = block.children ?? [];
    }
    return block;
}

function humanLabel(block: Block): string {
    const def = getBlockDefinition(block.type);
    const title = String(block.props.title ?? block.props.content ?? block.props.text ?? "").slice(0, 24);
    return title ? `${def?.label ?? block.type} « ${title} »` : (def?.label ?? block.type);
}

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
    const setBlockErrors = useBuilderStore((s) => s.setBlockErrors);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const collapseAll = useBuilderStore((s) => s.collapseAll);
    const expandAll = useBuilderStore((s) => s.expandAll);
    const deleteBlock = useBuilderStore((s) => s.deleteBlock);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const duplicateBlock = useBuilderStore((s) => s.duplicateBlock);
    const moveBlockUp = useBuilderStore((s) => s.moveBlockUp);
    const moveBlockDown = useBuilderStore((s) => s.moveBlockDown);

    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [switching, setSwitching] = useState(false);
    const [insertDialogOpen, setInsertDialogOpen] = useState(false);
    const [insertContext, setInsertContext] = useState<{ parentId: string | null; index: number }>(
        { parentId: null, index: Number.MAX_SAFE_INTEGER }
    );
    const previewRef = useRef<{ reload: () => void } | null>(null);

    // Initialiser les blocs au montage
    useEffect(() => {
        setBlocks(initialBlocks, moduleSlug);
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
                const body = await res.json().catch(() => null) as ApiErrorBody | null;
                const details = body?.details ?? [];

                if (details.length > 0) {
                    const currentBlocks = useBuilderStore.getState().blocks;
                    const errors: Record<string, string> = {};
                    for (const d of details) {
                        const block = resolvePathToBlock(currentBlocks, d.path);
                        if (block) errors[block.id] = d.message;
                    }
                    setBlockErrors(errors);

                    toast.error(
                        `${details.length} erreur${details.length > 1 ? "s" : ""} dans le contenu`,
                        {
                            description: (
                                <ul className="mt-1 space-y-1">
                                    {details.slice(0, 5).map((d, i) => {
                                        const block = resolvePathToBlock(currentBlocks, d.path);
                                        return (
                                            <li key={i} className="text-xs leading-snug">
                                                <span className="font-semibold">
                                                    {block ? humanLabel(block) : d.path}
                                                </span>
                                                {" — "}{d.message}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) as React.ReactNode,
                            duration: 10000,
                        }
                    );
                } else {
                    toast.error("Échec de la sauvegarde", {
                        description: body?.error ?? `HTTP ${res.status}`,
                    });
                }
                return;
            }
            setBlockErrors({});
            markSaved();
            toast.success("Contenu sauvegardé.");
            previewRef.current?.reload();
        } catch (err) {
            toast.error("Erreur réseau", {
                description: err instanceof Error ? err.message : "Erreur inconnue",
            });
        } finally {
            setSaving(false);
        }
    }, [isDirty, saving, moduleSlug, sectionSlug, contentType, markSaved, setBlockErrors]);

    const handleSwitchToDb = useCallback(async () => {
        if (switching) return;
        setSwitching(true);
        try {
            const res = await fetch(
                `/api/admin/content/${moduleSlug}/${sectionSlug}/${contentType}`,
                { method: "PATCH" }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => null) as { error?: string } | null;
                toast.error("Échec du passage en DB", {
                    description: body?.error ?? `HTTP ${res.status}`,
                });
                return;
            }
            toast.success("Contenu basculé en DB. Cache rafraîchi.");
            router.refresh();
        } catch (err) {
            toast.error("Erreur réseau", {
                description: err instanceof Error ? err.message : "Erreur inconnue",
            });
        } finally {
            setSwitching(false);
        }
    }, [switching, moduleSlug, sectionSlug, contentType, router]);

    const openInsertWithContext = useCallback(() => {
        const { selectedId, blocks } = useBuilderStore.getState();
        if (selectedId) {
            const selected = findBlock(blocks, selectedId);
            if (selected && isContainer(selected.type)) {
                setInsertContext({ parentId: selectedId, index: Number.MAX_SAFE_INTEGER });
            } else {
                const loc = findParent(blocks, selectedId);
                setInsertContext({
                    parentId: loc?.parent?.id ?? null,
                    index: loc ? loc.index + 1 : Number.MAX_SAFE_INTEGER,
                });
            }
        } else {
            setInsertContext({ parentId: null, index: Number.MAX_SAFE_INTEGER });
        }
        setInsertDialogOpen(true);
    }, []);

    const openInsertAtRoot = useCallback(() => {
        setInsertContext({ parentId: null, index: Number.MAX_SAFE_INTEGER });
        setInsertDialogOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        const { selectedId } = useBuilderStore.getState();
        if (selectedId) deleteBlock(selectedId);
    }, [deleteBlock]);

    const handleEscape = useCallback(() => {
        selectBlock(null);
    }, [selectBlock]);

    const handleDuplicate = useCallback(() => {
        const { selectedId } = useBuilderStore.getState();
        if (selectedId) duplicateBlock(selectedId);
    }, [duplicateBlock]);

    const handleMoveUp = useCallback(() => {
        const { selectedId } = useBuilderStore.getState();
        if (selectedId) moveBlockUp(selectedId);
    }, [moveBlockUp]);

    const handleMoveDown = useCallback(() => {
        const { selectedId } = useBuilderStore.getState();
        if (selectedId) moveBlockDown(selectedId);
    }, [moveBlockDown]);

    const handleSelectNext = useCallback(() => {
        const { selectedId, blocks } = useBuilderStore.getState();
        const ids = findAllIds(blocks);
        if (ids.length === 0) return;
        if (!selectedId) { selectBlock(ids[0]); return; }
        const idx = ids.indexOf(selectedId);
        selectBlock(ids[Math.min(idx + 1, ids.length - 1)]);
    }, [selectBlock]);

    const handleSelectPrev = useCallback(() => {
        const { selectedId, blocks } = useBuilderStore.getState();
        const ids = findAllIds(blocks);
        if (ids.length === 0) return;
        if (!selectedId) { selectBlock(ids[ids.length - 1]); return; }
        const idx = ids.indexOf(selectedId);
        selectBlock(ids[Math.max(idx - 1, 0)]);
    }, [selectBlock]);

    useEditorShortcuts({
        onSave: handleSave,
        onUndo: undo,
        onRedo: redo,
        onInsert: openInsertWithContext,
        onCollapseAll: collapseAll,
        onExpandAll: expandAll,
        onDelete: handleDelete,
        onEscape: handleEscape,
        onDuplicate: handleDuplicate,
        onMoveUp: handleMoveUp,
        onMoveDown: handleMoveDown,
        onSelectNext: handleSelectNext,
        onSelectPrev: handleSelectPrev,
    });

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900">
            <EditorToolbar
                moduleTitle={moduleTitle}
                sectionTitle={sectionTitle}
                contentType={contentType}
                source={source}
                saving={saving}
                onSave={() => void handleSave()}
                onSwitchToDb={source === "file" ? () => void handleSwitchToDb() : undefined}
                switching={switching}
            />

            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Panneau gauche — arbre de blocs */}
                <div className="w-[420px] min-w-[280px] max-w-[600px] flex flex-col border-r border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50/40 dark:bg-slate-900/40">
                    <EditorTree onInsertAtRoot={openInsertAtRoot} />
                </div>

                {/* Panneau droit — prévisualisation */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
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
                parentId={insertContext.parentId}
                index={insertContext.index}
            />
        </div>
    );
}
