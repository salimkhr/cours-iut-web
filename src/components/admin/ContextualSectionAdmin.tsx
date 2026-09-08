"use client";

import Link from "next/link";
import {Pencil, Settings2} from "lucide-react";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {moduleColor} from "@/lib/moduleColor";

interface ContextualSectionAdminProps {
    module: Module;
    section: Section;
}

export default function ContextualSectionAdmin({module, section}: ContextualSectionAdminProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    style={{
                        "--module-color": moduleColor(module),
                        "--module-color-dark": moduleColor(module, "dark"),
                    } as React.CSSProperties}
                    className="group h-auto gap-2 rounded-lg border-[3px] border-(--module-color) bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-brand-dark shadow-none transition-all duration-300 hover:border-(--module-color) hover:bg-(--module-color) hover:text-white dark:text-brand-light dark:hover:text-brand-dark"
                >
                    Gérer
                    <Settings2 className="size-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
                <DropdownMenuItem asChild>
                    <Link href={`/${module.path}/${section.path}/edit`}>
                        <Pencil aria-hidden="true"/>
                        Modifier la section
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
