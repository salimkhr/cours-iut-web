"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
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
        <div className="flex flex-col h-screen overflow-hidden">
            <header className="flex items-center gap-3 px-4 py-3 border-b bg-card flex-shrink-0">
                <Link href="/admin" className="text-muted-foreground hover:text-foreground text-sm">
                    ← Admin
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium">{moduleTitle}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium">{sectionTitle}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium capitalize">{contentType}</span>

                <Badge variant={source === "db" ? "default" : "secondary"} className="ml-2">
                    {source === "db" ? "DB ✓" : "Fichier"}
                </Badge>

                <div className="flex-1" />

                {isDirty && (
                    <span className="text-xs text-muted-foreground">Modifications non sauvegardées</span>
                )}
                <Button size="sm" onClick={() => void handleSave()} disabled={!isDirty}>
                    Sauvegarder
                </Button>
            </header>

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
