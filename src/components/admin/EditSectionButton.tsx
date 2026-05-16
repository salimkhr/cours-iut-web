'use client'

// Composant wrapper pour l'ajout (pour garder la compatibilité)
import Module from "@/types/Module";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import SectionForm, {Section} from "@/components/admin/SectionForm";
import {Edit} from "lucide-react";

interface AddSectionButtonProps {
    modData: Module;
    onAdd: (section: Section) => void;
    section: Section;
}

export default function EditSectionButton({modData, onAdd, section}: AddSectionButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="flex justify-end mb-2">
                <Button
                    onClick={() => setOpen(true)}
                    className={`bg-${modData.path} text-white hover:opacity-90 border-transparent`}
                >
                    <Edit/>
                </Button>
            </div>

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