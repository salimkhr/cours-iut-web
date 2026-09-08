"use client";

import Link from "next/link";
import {Settings2} from "lucide-react";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import {Button} from "@/components/ui/button";
import {moduleColor} from "@/lib/moduleColor";

interface ContextualSectionAdminProps {
    module: Module;
    section: Section;
}

export default function ContextualSectionAdmin({module, section}: ContextualSectionAdminProps) {
    return (
        <Button
            asChild
            variant="outline"
            style={{
                "--module-color": moduleColor(module),
                "--module-color-dark": moduleColor(module, "dark"),
            } as React.CSSProperties}
            className="group h-auto gap-2 rounded-lg border-[3px] border-(--module-color) bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-brand-dark shadow-none transition-all duration-300 hover:border-(--module-color) hover:bg-(--module-color) hover:text-white dark:text-brand-light dark:hover:text-brand-dark"
        >
            <Link href={`/${module.path}/${section.path}/edit`}>
                    Gérer
                <Settings2 className="size-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true"/>
            </Link>
        </Button>
    );
}
