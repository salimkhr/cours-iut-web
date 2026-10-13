"use client";

import Link from "next/link";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Pencil, Plus, Settings2} from "lucide-react";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InlineSectionRow from "@/components/admin/module-workflow/InlineSectionRow";
import {moduleColor} from "@/lib/moduleColor";

interface ContextualModuleAdminProps {
    module: Module;
}

export default function ContextualModuleAdmin({module}: ContextualModuleAdminProps) {
    const [sectionOpen, setSectionOpen] = useState(false);
    const router = useRouter();

    const refreshAndCloseSection = (saved?: Section) => {
        setSectionOpen(false);
        if (saved) router.refresh();
    };

    return (
        <>
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
                <DropdownMenuContent align="start" className="min-w-52">
                    <DropdownMenuItem asChild>
                        <Link href={`/${module.path}/edit`}>
                            <Pencil aria-hidden="true"/>
                            Modifier le module
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSectionOpen(true)}>
                        <Plus aria-hidden="true"/>
                        Ajouter une section
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={sectionOpen} onOpenChange={setSectionOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl lg:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Ajouter une section à {module.title}</DialogTitle>
                    </DialogHeader>
                    {sectionOpen && <InlineSectionRow module={module} section={null} onDone={refreshAndCloseSection}/>}
                </DialogContent>
            </Dialog>
        </>
    );
}
