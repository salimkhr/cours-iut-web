'use client'

// Composant wrapper pour l'ajout (pour garder la compatibilité)
import Module from "@/types/Module";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import SectionForm, {Section} from "@/components/admin/SectionForm";
import {PlusSquare} from "lucide-react";

interface AddSectionButtonProps {
    modData: Module;
    onAdd: (section: Section) => void;
}

export default function AddSectionButton({modData, onAdd}: AddSectionButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="flex justify-end mb-2">
                <Button
                    onClick={() => setOpen(true)}
                    variant="outline"
                    className={`border-${modData.path} text-${modData.path}`}
                >
                    <PlusSquare/> Ajouter un nouveau cours
                </Button>
            </div>

            <SectionForm
                modData={modData}
                mode="add"
                open={open}
                onOpenChange={setOpen}
                onSubmit={onAdd}
            />
        </>
    );
}