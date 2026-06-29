'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings, Trash2, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import EditModuleSheet from '@/components/admin/EditModuleSheet';
import SectionForm, { Section } from '@/components/admin/SectionForm';
import { ModuleFormValues } from '@/lib/schemas/module.schema';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';
import {moduleColor} from '@/lib/moduleColor';

interface AdminModuleFabProps {
    module: Module;
}

export default function AdminModuleFab({ module }: AdminModuleFabProps) {
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const { addSection, deleteModule } = useAdminApi();

    const handleEditModule = async (data: ModuleFormValues) => {
        const res = await fetch(`/api/admin/modules/${module._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            toast.error('Erreur lors de la mise à jour du module');
            throw new Error('API error');
        }

        toast.success('Module mis à jour');
        router.refresh();
    };

    const handleAddSection = async (section: Section) => {
        await addSection(module._id as unknown as string, section);
        router.refresh();
    };

    const handleDeleteModule = async () => {
        setDeleting(true);
        try {
            await deleteModule(module._id as unknown as string);
            toast.success(`Module "${module.title}" supprimé.`);
            router.back();
        } catch {
            toast.error('Erreur lors de la suppression du module.');
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
                        style={{ backgroundColor: moduleColor(module) }}
                    >
                        <Wrench className="w-5 h-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="top"
                    align="end"
                    className="mb-2 min-w-[200px] bg-[#f7ebd9] dark:bg-[#13110d] border-bridge-500/45 shadow-[0_8px_24px_-4px_rgba(147,97,58,0.3)]"
                >
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setEditModuleOpen(true)}
                    >
                        <Settings className="w-4 h-4" />
                        Modifier le module
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setAddSectionOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter une section
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => setDeleteConfirmOpen(true)}
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer le module
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditModuleSheet
                module={module}
                open={editModuleOpen}
                onOpenChange={setEditModuleOpen}
                onSubmit={handleEditModule}
            />

            <SectionForm
                modData={module}
                mode="add"
                open={addSectionOpen}
                onOpenChange={setAddSectionOpen}
                onSubmit={handleAddSection}
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="p-0 gap-0 overflow-hidden bg-[#f7ebd9] dark:bg-[#13110d] border-bridge-500/45">
                    <div
                        className="flex items-center gap-3 px-6 py-4"
                        style={{ backgroundColor: moduleColor(module) }}
                    >
                        <Trash2 className="w-5 h-5 text-white shrink-0" />
                        <AlertDialogTitle className="text-white font-bold text-lg">
                            Supprimer le module ?
                        </AlertDialogTitle>
                    </div>
                    <div className="px-6 py-5">
                        <AlertDialogDescription className="text-brand-dark dark:text-bridge-200">
                            Le module <strong>{module.title}</strong> et toutes ses sections seront
                            définitivement supprimés. Cette action est irréversible.
                        </AlertDialogDescription>
                    </div>
                    <AlertDialogFooter className="px-6 pb-5">
                        <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteModule}
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
