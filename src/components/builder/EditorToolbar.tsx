"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Save, Loader2, AlertCircle, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/lib/store/builderStore";

interface EditorToolbarProps {
    moduleTitle: string;
    sectionTitle: string;
    contentType: string;
    source: "file" | "db";
    saving: boolean;
    onSave: () => void;
}

export function EditorToolbar({
    moduleTitle,
    sectionTitle,
    contentType,
    source,
    saving,
    onSave,
}: EditorToolbarProps) {
    const isDirty = useBuilderStore((s) => s.isDirty);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const canUndo = useBuilderStore((s) => s._history.length > 0);
    const canRedo = useBuilderStore((s) => s._future.length > 0);

    return (
        <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <Link
                href="/admin"
                className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
            >
                <ChevronLeft className="w-3.5 h-3.5" />
                Admin
            </Link>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1 text-xs leading-none">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                        {moduleTitle}
                    </span>
                    <ChevronRight className="w-3 h-3 shrink-0 text-slate-400/50" />
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                        {sectionTitle}
                    </span>
                </div>
                <div className="flex items-center gap-2 leading-none">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-blue-600 dark:text-blue-400">
                        {contentType}
                    </span>
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] font-mono h-4 px-1.5 rounded",
                            source === "db"
                                ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                                : "border-slate-400/50 text-slate-500 dark:text-slate-400"
                        )}
                    >
                        {source === "db" ? "DB" : "fichier"}
                    </Badge>
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {isDirty && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mr-1">
                        <AlertCircle className="w-3 h-3" />
                        Non sauvegardé
                    </span>
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                    disabled={!canUndo}
                    title="Annuler (Ctrl+Z)"
                    onClick={undo}
                >
                    <Undo2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                    disabled={!canRedo}
                    title="Refaire (Ctrl+Y)"
                    onClick={redo}
                >
                    <Redo2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={!isDirty || saving}
                    className="gap-1.5 h-8 text-xs ml-1"
                >
                    {saving
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sauvegarde…</>
                        : <><Save className="w-3.5 h-3.5" /> Sauvegarder</>
                    }
                </Button>
            </div>
        </header>
    );
}
