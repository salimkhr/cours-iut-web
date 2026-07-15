"use client";

import {useState} from "react";
import Link from "next/link";
import {ArrowRight, Database, FileText, GraduationCap, UploadCloud} from "lucide-react";
import {Button} from "@/components/ui/button";
import MigrateButton from "@/components/admin/MigrateButton";
import ExportImportSheet from "@/components/admin/ExportImportSheet";
import {ADMIN_TOOL_ACTIONS} from "@/components/admin/adminDashboardConfig";

const TOOL_ICONS = {
    migration: Database,
    "export-import": UploadCloud,
    calibrage: GraduationCap,
    pedagogie: FileText,
} as const;

export default function AdminToolsPanel() {
    const [exportImportOpen, setExportImportOpen] = useState(false);

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                {ADMIN_TOOL_ACTIONS.map((action) => {
                    const Icon = TOOL_ICONS[action.id];
                    return (
                        <article
                            key={action.id}
                            className="rounded-lg border border-bridge-500/35 bg-bridge-50 p-5 shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:bg-bridge-800 dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]"
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

                            {action.id === "migration" ? (
                                <MigrateButton/>
                            ) : action.id === "export-import" ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="min-h-11 gap-2 border-bridge-500/45"
                                    onClick={() => setExportImportOpen(true)}
                                >
                                    Ouvrir
                                    <ArrowRight className="size-4" aria-hidden="true"/>
                                </Button>
                            ) : (
                                <Button asChild variant="outline" className="min-h-11 gap-2 border-bridge-500/45">
                                    <Link href={action.href ?? "/admin"}>
                                        Ouvrir
                                        <ArrowRight className="size-4" aria-hidden="true"/>
                                    </Link>
                                </Button>
                            )}
                        </article>
                    );
                })}
            </div>

            <ExportImportSheet open={exportImportOpen} onOpenChange={setExportImportOpen}/>
        </>
    );
}
