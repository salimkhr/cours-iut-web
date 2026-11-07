"use client";

import {useState} from "react";
import {ArrowRight, Database, ListChecks, Loader2, ScanSearch, UploadCloud, Wrench} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import MigrateSheet from "@/components/admin/MigrateSheet";
import ExportImportSheet from "@/components/admin/ExportImportSheet";
import SlideRepairSheet from "@/components/admin/SlideRepairSheet";
import {ADMIN_TOOL_ACTIONS} from "@/components/admin/adminDashboardConfig";
import {ADMIN_CARD} from "@/components/admin/ui/adminStyles";
import type {ModuleOption} from "@/components/admin/adminTypes";

const TOOL_ICONS = {
    migration: Database,
    "export-import": UploadCloud,
    "slide-repair": Wrench,
    indexes: ListChecks,
    "rag-index": ScanSearch,
} as const;

/** Actions lancées directement (sans panneau) : le résultat s'affiche dans une notification. */
const INSTANT_ACTIONS = new Set<string>(["indexes", "rag-index"]);

export type {ModuleOption} from "@/components/admin/adminTypes";

interface AdminToolsPanelProps {
    modules: ModuleOption[];
}

export default function AdminToolsPanel({modules}: AdminToolsPanelProps) {
    const [migrationOpen, setMigrationOpen] = useState(false);
    const [exportImportOpen, setExportImportOpen] = useState(false);
    const [slideRepairOpen, setSlideRepairOpen] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);

    async function runIndexes() {
        const res = await fetch("/api/admin/indexes", {method: "POST"});
        const data = (await res.json().catch(() => ({}))) as {indexes?: string[]; error?: string};
        if (!res.ok) throw new Error(data.error ?? "Création des index impossible");
        toast.success(`${data.indexes?.length ?? 0} index en place.`, {description: data.indexes?.join(", ")});
    }

    async function runRagIndex() {
        const res = await fetch("/api/admin/rag/sync", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({full: true}),
        });
        const data = (await res.json().catch(() => ({}))) as {contentsChecked?: number; chunksEmbedded?: number; error?: string};
        if (!res.ok) throw new Error(data.error ?? "Indexation RAG impossible");
        toast.success(`Index RAG reconstruit : ${data.chunksEmbedded ?? 0} morceaux.`, {
            description: `${data.contentsChecked ?? 0} cours et TP vectorisés.`,
        });
    }

    async function runInstant(id: string) {
        setBusy(id);
        try {
            await (id === "indexes" ? runIndexes() : runRagIndex());
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Action impossible");
        } finally {
            setBusy(null);
        }
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                {ADMIN_TOOL_ACTIONS.map((action) => {
                    const Icon = TOOL_ICONS[action.id];
                    const instant = INSTANT_ACTIONS.has(action.id);
                    const running = busy === action.id;
                    return (
                        <article
                            key={action.id}
                            className={`${ADMIN_CARD} p-5`}
                        >
                            <div className="mb-4 flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/12 text-brand-accent-dark dark:bg-brand-primary/20 dark:text-brand-primary">
                                    <Icon className="size-5" aria-hidden="true"/>
                                </span>
                                <div>
                                    <h2 className="font-bold text-brand-dark dark:text-bridge-100">{action.title}</h2>
                                    <p className="mt-1 text-sm leading-relaxed text-bridge-600 dark:text-bridge-300">
                                        {action.description}
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="min-h-11 gap-2 border-bridge-500/45"
                                disabled={busy !== null && instant}
                                onClick={() => {
                                    if (action.id === "migration") setMigrationOpen(true);
                                    else if (action.id === "export-import") setExportImportOpen(true);
                                    else if (instant) void runInstant(action.id);
                                    else setSlideRepairOpen(true);
                                }}
                            >
                                {instant ? (running ? "En cours…" : "Lancer") : "Ouvrir"}
                                {running
                                    ? <Loader2 className="size-4 animate-spin" aria-hidden="true"/>
                                    : <ArrowRight className="size-4" aria-hidden="true"/>}
                            </Button>
                        </article>
                    );
                })}
            </div>

            <MigrateSheet open={migrationOpen} onOpenChange={setMigrationOpen}/>
            <ExportImportSheet open={exportImportOpen} onOpenChange={setExportImportOpen} modules={modules}/>
            <SlideRepairSheet open={slideRepairOpen} onOpenChange={setSlideRepairOpen}/>
        </>
    );
}
