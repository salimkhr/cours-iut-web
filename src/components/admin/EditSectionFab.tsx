'use client';

import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Pencil} from "lucide-react";
import {Button} from "@/components/ui/button";
import SectionForm, {Section as SectionForm_} from "@/components/admin/SectionForm";
import useAdminApi from "@/hook/admin/useAdminApi";
import Module from "@/types/Module";
import Section from "@/types/Section";
import {cn} from "@/lib/utils";

interface EditSectionFabProps {
    modData: Module;
    section: Section;
}

export default function EditSectionFab({modData, section}: EditSectionFabProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const {editSection} = useAdminApi();

    const handleSubmit = async (updated: SectionForm_) => {
        try {
            await editSection(modData._id as unknown as string, String(section._id), updated);
            toast.success("Section mise à jour.");
            router.refresh();
        } catch {
            toast.error("Erreur lors de la mise à jour de la section.");
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                aria-label="Modifier la section"
                title="Modifier la section"
                className={cn(
                    "fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg text-white dark:text-brand-dark",
                    `bg-${modData.path} hover:opacity-90`
                )}
            >
                <Pencil className="w-5 h-5"/>
            </Button>

            <SectionForm
                modData={modData}
                mode="edit"
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
                section={section as unknown as SectionForm_}
            />
        </>
    );
}
