'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Plus, Settings} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import EditModuleSheet from '@/components/admin/EditModuleSheet';
import SectionForm, {Section} from '@/components/admin/SectionForm';
import {ModuleFormValues} from '@/lib/schemas/module.schema';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';

interface AdminModuleFabProps {
    module: Module;
}

export default function AdminModuleFab({module}: AdminModuleFabProps) {
    const [expanded, setExpanded] = useState(false);
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const router = useRouter();
    const {addSection} = useAdminApi();

    const handleEditModule = async (data: ModuleFormValues) => {
        const res = await fetch(`/api/admin/modules/${module._id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
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

    const openOption = (action: 'edit' | 'add') => {
        setExpanded(false);
        if (action === 'edit') setEditModuleOpen(true);
        else setAddSectionOpen(true);
    };

    const optionClass = cn(
        'h-10 w-10 rounded-full flex items-center justify-center shadow-md text-white dark:text-brand-dark',
        `bg-${module.path}`
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
                    'flex flex-col items-end gap-3 transition-all duration-200 origin-bottom',
                    expanded
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-3 pointer-events-none'
                )}>
                    <button
                        onClick={() => openOption('edit')}
                        className="flex items-center gap-2"
                        aria-label="Modifier le module"
                    >
                        <span className="bg-background text-xs font-medium px-2.5 py-1 rounded-full shadow border border-border whitespace-nowrap">
                            Modifier le module
                        </span>
                        <div className={optionClass}>
                            <Settings className="w-4 h-4"/>
                        </div>
                    </button>

                    <button
                        onClick={() => openOption('add')}
                        className="flex items-center gap-2"
                        aria-label="Ajouter une section"
                    >
                        <span className="bg-background text-xs font-medium px-2.5 py-1 rounded-full shadow border border-border whitespace-nowrap">
                            Ajouter une section
                        </span>
                        <div className={optionClass}>
                            <Plus className="w-4 h-4"/>
                        </div>
                    </button>
                </div>

                {/* Main FAB */}
                <Button
                    onClick={() => setExpanded(prev => !prev)}
                    aria-label="Options admin"
                    aria-expanded={expanded}
                    className={cn(
                        'h-12 w-12 rounded-full p-0 shadow-lg text-white dark:text-brand-dark transition-transform duration-200',
                        `bg-${module.path} hover:opacity-90`,
                        expanded && 'rotate-45'
                    )}
                >
                    <Plus className="w-5 h-5"/>
                </Button>
            </div>

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
        </>
    );
}
