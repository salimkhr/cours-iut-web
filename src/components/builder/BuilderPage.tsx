"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

export function BuilderPage({ moduleTitle, sectionTitle, contentType, source }: BuilderPageProps) {
    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-h))] overflow-hidden">
            <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90 backdrop-blur-sm">
                <Link
                    href="/admin"
                    className="flex items-center gap-1 text-xs font-medium text-bridge-500 dark:text-bridge-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors shrink-0"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Admin
                </Link>
                <div className="w-px h-8 bg-bridge-400/25 dark:bg-bridge-500/30 shrink-0" />
                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1 text-xs leading-none">
                        <span className="font-semibold text-bridge-700 dark:text-bridge-200 truncate max-w-[180px]">
                            {moduleTitle}
                        </span>
                        <ChevronRight className="w-3 h-3 shrink-0 text-bridge-400/50" />
                        <span className="text-bridge-500 dark:text-bridge-400 truncate max-w-[220px]">
                            {sectionTitle}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 leading-none">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-primary">
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
            </header>
            <div className="flex-1 flex items-center justify-center text-bridge-500 dark:text-bridge-400 text-sm">
                Éditeur en cours de migration — utilisez le MCP server ou attendez le fallback web.
            </div>
        </div>
    );
}
