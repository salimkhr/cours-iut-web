"use client";

import Module from "@/types/Module";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import SectionForm, {Section} from "@/components/admin/SectionForm";
import {Edit} from "lucide-react";
import {moduleColor} from "@/lib/moduleColor";

interface AddSectionButtonProps {
    modData: Module;
    onAdd: (section: Section) => Promise<void> | void;
    section: Section;
}

export default function EditSectionButton({modData, onAdd, section}: AddSectionButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                size="icon"
                aria-label="Modifier la section"
                className="h-11 w-11 text-white dark:text-brand-dark hover:opacity-90 border-transparent"
                style={{backgroundColor: moduleColor(modData)}}
            >
                <Edit className="size-4" aria-hidden="true"/>
            </Button>

            <SectionForm
                modData={modData}
                mode="edit"
                open={open}
                onOpenChange={setOpen}
                onSubmit={onAdd}
                section={section}
            />
        </>
    );
}
