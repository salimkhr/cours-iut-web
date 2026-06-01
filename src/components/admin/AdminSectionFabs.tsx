'use client';

import {useState} from "react";
import {useRouter} from "next/navigation";
import {ClipboardList, Pencil, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import SectionForm, {Section as SectionForm_} from "@/components/admin/SectionForm";
import QuizEditorSheet from "@/components/admin/QuizEditorSheet";
import useAdminApi from "@/hook/admin/useAdminApi";
import Module from "@/types/Module";
import Section from "@/types/Section";
import {cn} from "@/lib/utils";

interface AdminSectionFabsProps {
    modData: Module;
    section: Section;
}

export default function AdminSectionFabs({modData, section}: AdminSectionFabsProps) {
    const [expanded, setExpanded] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [quizOpen, setQuizOpen] = useState(false);
    const router = useRouter();
    const {editSection} = useAdminApi();

    const handleSubmit = async (updated: SectionForm_) => {
        await editSection(modData._id as unknown as string, updated);
        router.refresh();
    };

    const openOption = (action: 'quiz' | 'edit') => {
        setExpanded(false);
        if (action === 'quiz') setQuizOpen(true);
        else setEditOpen(true);
    };

    const optionClass = cn(
        "h-10 w-10 rounded-full flex items-center justify-center shadow-md text-white dark:text-brand-dark",
        `bg-${modData.path}`
    );

    return (
        <>
            {expanded && (
                <div
                    className="fixed inset-0 z-[39]"
                    onClick={() => setExpanded(false)}
                />
            )}

            <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
                {/* Options speed-dial */}
                <div className={cn(
                    "flex flex-col items-end gap-3 transition-all duration-200 origin-bottom",
                    expanded
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-3 pointer-events-none"
                )}>
                    <button
                        onClick={() => openOption('quiz')}
                        className="flex items-center gap-2 group"
                        aria-label="Éditer le quiz"
                    >
                        <span className="bg-background text-xs font-medium px-2.5 py-1 rounded-full shadow border border-border whitespace-nowrap">
                            Quiz
                        </span>
                        <div className={optionClass}>
                            <ClipboardList className="w-4 h-4"/>
                        </div>
                    </button>

                    <button
                        onClick={() => openOption('edit')}
                        className="flex items-center gap-2 group"
                        aria-label="Modifier la section"
                    >
                        <span className="bg-background text-xs font-medium px-2.5 py-1 rounded-full shadow border border-border whitespace-nowrap">
                            Section
                        </span>
                        <div className={optionClass}>
                            <Pencil className="w-4 h-4"/>
                        </div>
                    </button>
                </div>

                {/* Main FAB */}
                <Button
                    onClick={() => setExpanded(prev => !prev)}
                    aria-label="Options admin"
                    aria-expanded={expanded}
                    className={cn(
                        "h-12 w-12 rounded-full p-0 shadow-lg text-white dark:text-brand-dark transition-transform duration-200",
                        `bg-${modData.path} hover:opacity-90`,
                        expanded && "rotate-45"
                    )}
                >
                    <Plus className="w-5 h-5"/>
                </Button>
            </div>

            <SectionForm
                modData={modData}
                mode="edit"
                open={editOpen}
                onOpenChange={setEditOpen}
                onSubmit={handleSubmit}
                section={section as unknown as SectionForm_}
            />
            <QuizEditorSheet
                section={section}
                modData={modData}
                open={quizOpen}
                onOpenChange={setQuizOpen}
            />
        </>
    );
}
