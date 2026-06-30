"use client";

import Link from "next/link";
import { ChevronRight, Save, Loader2, AlertCircle, Undo2, Redo2, Database, Users } from "lucide-react";
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
    /** Bascule la ref en source:"db" + revalide le cache (affiché si source === "file"). */
    onSwitchToDb?: () => void;
    switching?: boolean;
}

export function EditorToolbar({
    moduleTitle,
    sectionTitle,
    contentType,
    source,
    saving,
    onSave,
    onSwitchToDb,
    switching,
}: EditorToolbarProps) {
    const isDirty = useBuilderStore((s) => s.isDirty);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const canUndo = useBuilderStore((s) => s._history.length > 0);
    const canRedo = useBuilderStore((s) => s._future.length > 0);
    const moduleSlug = useBuilderStore((s) => s.moduleSlug);

    return (
        <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-bridge-200 dark:border-bridge-700 bg-bridge-50/95 dark:bg-bridge-900/95 backdrop-blur-sm">

            {/* Bouton Utilisateurs */}
            <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs font-medium text-bridge-600 dark:text-bridge-300 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-bridge-100 dark:hover:bg-bridge-800 shrink-0"
            >
                <Link href="/admin">
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Utilisateurs</span>
                </Link>
            </Button>

            <div className="w-px h-8 bg-bridge-200 dark:bg-bridge-700 shrink-0" />

            {/* Fil d'Ariane */}
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1 text-xs leading-none min-w-0">
                    <span className="font-semibold text-brand-dark dark:text-bridge-100 truncate">
                        {moduleTitle}
                    </span>
                    <ChevronRight className="w-3 h-3 shrink-0 text-bridge-400/60" />
                    <span className="text-bridge-500 dark:text-bridge-400 truncate">
                        {sectionTitle}
                    </span>
                </div>
                <div className="flex items-center gap-2 leading-none">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--mod-color)]">
                        {contentType}
                    </span>
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] font-mono h-4 px-1.5 rounded",
                            source === "db"
                                ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                                : "border-bridge-400/50 text-bridge-500 dark:text-bridge-400"
                        )}
                    >
                        {source === "db" ? "DB" : "fichier"}
                    </Badge>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
                {source === "file" && onSwitchToDb && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs border-bridge-300 dark:border-bridge-600 text-bridge-600 dark:text-bridge-300 hover:bg-bridge-100 dark:hover:bg-bridge-800"
                        onClick={onSwitchToDb}
                        disabled={switching}
                        title="Publier ce contenu en base (DB) et rafraîchir le cache"
                    >
                        {switching
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Passage…</>
                            : <><Database className="w-3.5 h-3.5" /> Passer en DB</>
                        }
                    </Button>
                )}
                {isDirty && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-bridge-400 dark:text-bridge-500 mr-1">
                        <AlertCircle className="w-3 h-3" />
                        Non sauvegardé
                    </span>
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-bridge-400 hover:text-[var(--mod-color)] hover:bg-bridge-100 dark:hover:bg-bridge-800 disabled:opacity-30"
                    disabled={!canUndo}
                    title="Annuler (Ctrl+Z)"
                    onClick={undo}
                >
                    <Undo2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-bridge-400 hover:text-[var(--mod-color)] hover:bg-bridge-100 dark:hover:bg-bridge-800 disabled:opacity-30"
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
                    className="gap-1.5 h-8 text-xs ml-1 hover:opacity-90"
                    style={moduleSlug ? { backgroundColor: "var(--mod-color)", color: "white", borderColor: "var(--mod-color)" } : undefined}
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
