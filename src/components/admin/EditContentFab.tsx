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
                "fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg text-white dark:text-brand-dark",
                `bg-${modulePath} hover:opacity-90`
            )}
        >
            <Link href={`/admin/content/${moduleSlug}/${sectionSlug}/${contentType}`}>
                <Pencil className="w-5 h-5" />
            </Link>
        </Button>
    );
}
