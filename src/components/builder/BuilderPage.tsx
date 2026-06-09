"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/lib/store/builderStore";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { PropsPanel } from "@/components/builder/PropsPanel";
import { AiAssistantPanel } from "@/components/builder/AiAssistantPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    const { blocks, isDirty, setBlocks, markSaved } = useBuilderStore();

    useEffect(() => {
        setBlocks(initialBlocks);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleSave() {
        try {
            const res = await fetch(
                `/api/admin/content/${moduleSlug}/${sectionSlug}/${contentType}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ blocks }),
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            markSaved();
            toast.success("Contenu sauvegardé.");
        } catch (err) {
            toast.error("Erreur lors de la sauvegarde.");
            console.error(err);
        }
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-h))] overflow-hidden">

            {/* Toolbar */}
            <header className="flex items-center gap-1.5 px-4 py-2 flex-shrink-0 border-b border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90 backdrop-blur-sm">

                {/* Breadcrumb */}
                <Link
                    href="/admin"
                    className="flex items-center gap-0.5 text-sm text-bridge-600 dark:text-bridge-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Admin
                </Link>

                <ChevronRight className="w-3.5 h-3.5 text-bridge-400/60 dark:text-bridge-600/60 shrink-0" />
                <span className="text-sm text-bridge-700 dark:text-bridge-300 font-medium truncate max-w-[100px] lg:max-w-[160px]">
                    {moduleTitle}
                </span>

                <ChevronRight className="w-3.5 h-3.5 text-bridge-400/60 dark:text-bridge-600/60 shrink-0" />
                <span className="text-sm text-bridge-700 dark:text-bridge-300 font-medium truncate max-w-[100px] lg:max-w-[160px]">
                    {sectionTitle}
                </span>

                <ChevronRight className="w-3.5 h-3.5 text-bridge-400/60 dark:text-bridge-600/60 shrink-0" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-primary dark:text-brand-primary">
                    {contentType}
                </span>

                <Badge
                    variant="outline"
                    className={cn(
                        "ml-1 text-[10px] font-mono border h-5 px-1.5",
                        source === "db"
                            ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                            : "border-bridge-400/50 text-bridge-600 dark:text-bridge-400"
                    )}
                >
                    {source === "db" ? "DB" : "fichier"}
                </Badge>

                <div className="flex-1" />

                {isDirty && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-bridge-500 dark:text-bridge-400">
                        <AlertCircle className="w-3 h-3" />
                        Non sauvegardé
                    </span>
                )}

                <Button
                    size="sm"
                    onClick={() => void handleSave()}
                    disabled={!isDirty}
                    className={cn(
                        "gap-1.5 h-7 text-xs transition-all",
                        isDirty
                            ? "bg-brand-primary hover:bg-brand-accent-dark text-brand-light"
                            : "opacity-40 cursor-default"
                    )}
                >
                    <Save className="w-3.5 h-3.5" />
                    Sauvegarder
                </Button>
            </header>

            {/* Builder area */}
            <div className="flex flex-1 min-h-0">
                <BuilderCanvas
                    moduleSlug={moduleSlug}
                    sectionSlug={sectionSlug}
                    contentType={contentType}
                />
                <PropsPanel isFixed={isFixed} />
            </div>

            <AiAssistantPanel
                moduleSlug={moduleSlug}
                sectionSlug={sectionSlug}
                contentType={contentType}
            />
        </div>
    );
}
