"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Save, AlertCircle, Puzzle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragEndEvent,
    type DragStartEvent,
    type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useBuilderStore } from "@/lib/store/builderStore";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { PropsPanel } from "@/components/builder/PropsPanel";
import { AiAssistantPanel } from "@/components/builder/AiAssistantPanel";
import { BLOCK_META } from "@/components/builder/BlockPaletteGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Block } from "@/types/CourseContent";
import type { BlockDefinition } from "@/lib/blockRegistry";
import { v4 as uuidv4 } from "uuid";

interface BuilderPageProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    moduleTitle: string;
    sectionTitle: string;
    initialBlocks: Block[];
    source: "file" | "db";
}

function useBuilderLayout() {
    const [isFixed, setIsFixed] = useState(true);
    useEffect(() => {
        function check() { setIsFixed(window.innerWidth >= 1024); }
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    return isFixed;
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
    const isFixed = useBuilderLayout();
    const { blocks, isDirty, setBlocks, markSaved, insertBlock, selectBlock, moveBlock } =
        useBuilderStore();

    const [activeDragDef, setActiveDragDef] = useState<BlockDefinition | null>(null);
    const [saving, setSaving] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setBlocks(initialBlocks);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isDirty) return;
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            e.preventDefault();
            e.returnValue = "";
        }
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    function handleDragStart(event: DragStartEvent) {
        const data = event.active.data.current as { origin?: string; def?: BlockDefinition } | undefined;
        if (data?.origin === "palette" && data.def) {
            setActiveDragDef(data.def);
        }
    }

    function handleDragOver(_event: DragOverEvent) {
        // Task 8 : gestion DnD inter-niveaux
    }

    function handleDragCancel() {
        setActiveDragDef(null);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveDragDef(null);

        if (!over) return;

        const data = active.data.current as { origin?: string; def?: BlockDefinition } | undefined;

        if (data?.origin === "palette" && data.def) {
            const def = data.def;
            const newBlock: Block = {
                id: uuidv4(),
                type: def.type,
                props: { ...def.defaultProps },
            };

            if (over.id === "canvas") {
                insertBlock(newBlock, null);
            } else {
                const idx = blocks.findIndex((b) => b.id === String(over.id));
                insertBlock(newBlock, null, idx !== -1 ? idx + 1 : undefined);
            }
            selectBlock(newBlock.id);
        } else {
            // Réordonnancement racine (inter-niveaux arrive en Task 8)
            if (active.id === over.id) return;
            const newIndex = blocks.findIndex((b) => b.id === String(over.id));
            if (newIndex === -1) return;
            moveBlock(String(active.id), null, newIndex);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
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
                throw new Error(body?.error ?? `HTTP ${res.status} ${res.statusText}`);
            }
            markSaved();
            toast.success("Contenu sauvegardé.");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur inconnue";
            toast.error("Échec de la sauvegarde", { description: message });
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    const overlayMeta = activeDragDef ? BLOCK_META[activeDragDef.type] : null;
    const OverlayIcon = overlayMeta?.icon ?? Puzzle;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className={`flex flex-col h-[calc(100dvh-var(--navbar-h))] overflow-hidden header-${moduleSlug}`}>

                {/* Toolbar */}
                <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90 backdrop-blur-sm">

                    {/* Zone gauche : navigation + contexte */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">

                        <Link
                            href="/admin"
                            style={{ textDecoration: "none" }}
                            onClick={(e) => {
                                if (isDirty) {
                                    e.preventDefault();
                                    setPendingHref("/admin");
                                }
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-bridge-500 dark:text-bridge-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors shrink-0 whitespace-nowrap"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Admin
                        </Link>

                        <div className="w-px h-8 bg-bridge-400/25 dark:bg-bridge-500/30 shrink-0" />

                        <div className="flex flex-col gap-0.5 min-w-0">
                            {/* Ligne 1 : module › section */}
                            <div className="flex items-center gap-1 text-xs leading-none">
                                <span className="font-semibold text-bridge-700 dark:text-bridge-200 truncate max-w-[100px] lg:max-w-[180px]">
                                    {moduleTitle}
                                </span>
                                <ChevronRight className="w-3 h-3 shrink-0 text-bridge-400/50 dark:text-bridge-600/50" />
                                <span className="text-bridge-500 dark:text-bridge-400 truncate max-w-[120px] lg:max-w-[220px]">
                                    {sectionTitle}
                                </span>
                            </div>

                            {/* Ligne 2 : contentType eyebrow + source badge */}
                            <div className="flex items-center gap-2 leading-none">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-primary dark:text-brand-primary">
                                    {contentType}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] font-mono h-4 px-1.5 rounded",
                                        source === "db"
                                            ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                                            : "border-bridge-400/50 text-bridge-500 dark:text-bridge-400 bg-bridge-100/50 dark:bg-bridge-800/50"
                                    )}
                                >
                                    {source === "db" ? "DB" : "fichier"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Zone droite : actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {isDirty && (
                            <span className="hidden sm:flex items-center gap-1.5 text-xs text-bridge-400 dark:text-bridge-500">
                                <AlertCircle className="w-3 h-3" />
                                Non sauvegardé
                            </span>
                        )}
                        <Button
                            size="sm"
                            onClick={() => void handleSave()}
                            disabled={!isDirty || saving}
                            className={cn(
                                "gap-1.5 h-8 text-xs transition-all",
                                isDirty
                                    ? "bg-brand-primary hover:bg-brand-accent-dark text-brand-light shadow-sm"
                                    : "opacity-40 cursor-default"
                            )}
                        >
                            {saving
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sauvegarde…</>
                                : <><Save className="w-3.5 h-3.5" /> Sauvegarder</>
                            }
                        </Button>
                    </div>
                </header>

                {/* Builder area */}
                <div className="flex flex-1 min-h-0">
                    <BuilderCanvas
                        moduleSlug={moduleSlug}
                        sectionSlug={sectionSlug}
                        contentType={contentType}
                    />
                    <PropsPanel isFixed={isFixed} moduleSlug={moduleSlug} />
                </div>

                <AiAssistantPanel
                    moduleSlug={moduleSlug}
                    sectionSlug={sectionSlug}
                    contentType={contentType}
                />
            </div>

            {/* Confirmation avant navigation avec modifications non sauvegardées */}
            <AlertDialog
                open={pendingHref !== null}
                onOpenChange={(open) => { if (!open) setPendingHref(null); }}
            >
                <AlertDialogContent
                    className={cn(
                        "bg-[#f7ebd9] dark:bg-[#13110d]",
                        "border border-bridge-500/45",
                        "shadow-[0_22px_44px_-14px_rgba(147,97,58,0.45)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.7)]",
                    )}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-brand-dark dark:text-bridge-100">
                            Modifications non sauvegardées
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-bridge-600 dark:text-bridge-400">
                            Si vous quittez maintenant, les modifications en cours seront perdues.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-bridge-500/45">
                            Rester
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pendingHref) router.push(pendingHref);
                                setPendingHref(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Quitter sans sauvegarder
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Ghost visuel pendant le drag depuis la palette */}
            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                {activeDragDef && (
                    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 border border-brand-primary/50 bg-bridge-50 dark:bg-bridge-900 shadow-xl select-none cursor-grabbing">
                        <div className="shrink-0 w-7 h-7 rounded-md bg-brand-primary/15 flex items-center justify-center">
                            <OverlayIcon className="w-3.5 h-3.5 text-brand-primary" />
                        </div>
                        <span className="text-xs font-semibold text-bridge-800 dark:text-bridge-100">
                            {activeDragDef.label}
                        </span>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
