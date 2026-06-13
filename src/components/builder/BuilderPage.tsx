"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Save, AlertCircle, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useBuilderStore } from "@/lib/store/builderStore";
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
import { useRouter } from "next/navigation";
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
    const { blocks, isDirty, setBlocks, markSaved } = useBuilderStore();
    const [saving, setSaving] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const router = useRouter();

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

    return (
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
                        <div className="flex items-center gap-1 text-xs leading-none">
                            <span className="font-semibold text-bridge-700 dark:text-bridge-200 truncate max-w-[100px] lg:max-w-[180px]">
                                {moduleTitle}
                            </span>
                            <ChevronRight className="w-3 h-3 shrink-0 text-bridge-400/50 dark:text-bridge-600/50" />
                            <span className="text-bridge-500 dark:text-bridge-400 truncate max-w-[120px] lg:max-w-[220px]">
                                {sectionTitle}
                            </span>
                        </div>

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
                        variant="outline"
                        className="hidden md:flex gap-1.5 h-8 text-xs border-bridge-400/40 dark:border-bridge-500/40 text-bridge-600 dark:text-bridge-300 hover:border-brand-primary/50 hover:text-brand-primary"
                        disabled
                    >
                        <Plus className="w-3.5 h-3.5" /> Ajouter un bloc
                    </Button>
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

            {/* Builder area — placeholder en attente du nouvel éditeur (A7+) */}
            <div className="flex flex-1 min-h-0 items-center justify-center text-bridge-400 dark:text-bridge-600 text-sm">
                Éditeur en cours de reconstruction…
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
        </div>
    );
}
