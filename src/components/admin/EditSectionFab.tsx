'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Settings, Trash2, Wrench} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import SectionForm, {Section as SectionForm_} from '@/components/admin/SectionForm';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';
import Section from '@/types/Section';
import {moduleColor} from '@/lib/moduleColor';

interface EditSectionFabProps {
    modData: Module;
    section: Section;
}

export default function EditSectionFab({modData, section}: EditSectionFabProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const {editSection, deleteSection} = useAdminApi();

    const handleSubmit = async (updated: SectionForm_) => {
        try {
            await editSection(modData._id as unknown as string, String(section._id), updated);
            toast.success('Section mise à jour.');
            router.refresh();
        } catch {
            toast.error('Erreur lors de la mise à jour de la section.');
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteSection(modData._id as unknown as string, section.path);
            toast.success('Section supprimée.');
            router.push(`/${modData.path}`);
        } catch {
            toast.error('Erreur lors de la suppression de la section.');
            setDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Actions admin"
                        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg text-white dark:text-brand-dark hover:opacity-90"
                        style={{ backgroundColor: moduleColor(modData) }}
                    >
                        <Wrench className="w-5 h-5"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="top"
                    align="end"
                    className="mb-2 min-w-[200px] bg-[#f7ebd9] dark:bg-[#13110d] border-bridge-500/45 shadow-[0_8px_24px_-4px_rgba(147,97,58,0.3)]"
                >
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setEditOpen(true)}
                    >
                        <Settings className="w-4 h-4"/>
                        Modifier la section
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => setDeleteConfirmOpen(true)}
                    >
                        <Trash2 className="w-4 h-4"/>
                        Supprimer la section
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <SectionForm
                modData={modData}
                mode="edit"
                open={editOpen}
                onOpenChange={setEditOpen}
                onSubmit={handleSubmit}
                section={section as unknown as SectionForm_}
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="p-0 gap-0 overflow-hidden bg-[#f7ebd9] dark:bg-[#13110d] border-bridge-500/45">
                    <div
                        className="flex items-center gap-3 px-6 py-4"
                        style={{ backgroundColor: moduleColor(modData) }}
                    >
                        <Trash2 className="w-5 h-5 text-white shrink-0"/>
                        <AlertDialogTitle className="text-white font-bold text-lg">
                            Supprimer la section ?
                        </AlertDialogTitle>
                    </div>
                    <div className="px-6 py-5">
                        <AlertDialogDescription className="text-brand-dark dark:text-bridge-200">
                            La section <strong>{section.title}</strong> sera définitivement supprimée.
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </div>
                    <AlertDialogFooter className="px-6 pb-5">
                        <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            variant="destructive"
                        >
                            {deleting ? 'Suppression…' : 'Supprimer définitivement'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
