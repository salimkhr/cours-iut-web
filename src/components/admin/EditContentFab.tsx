'use client';

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditContentFabProps {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    modulePath: string;
}

export default function EditContentFab({ moduleSlug, sectionSlug, contentType, modulePath }: EditContentFabProps) {
    return (
        <Button
            asChild
            aria-label="Éditer dans le builder"
            title="Éditer dans le builder"
            className={cn(
                "fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 text-white dark:text-brand-dark",
                "shadow-[0_4px_20px_-4px_rgba(147,97,58,0.55)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.7)]",
                "hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200",
                `bg-${modulePath}`
            )}
        >
            <Link href={`/admin/content/${moduleSlug}/${sectionSlug}/${contentType}`}>
                <Pencil className="w-5 h-5" />
            </Link>
        </Button>
    );
}
