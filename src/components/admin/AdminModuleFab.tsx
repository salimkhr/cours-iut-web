'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import EditModuleSheet from '@/components/admin/EditModuleSheet';
import SectionForm, { Section } from '@/components/admin/SectionForm';
import { ModuleFormValues } from '@/lib/schemas/module.schema';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';

interface AdminModuleFabProps {
    module: Module;
}

export default function AdminModuleFab({ module }: AdminModuleFabProps) {
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const router = useRouter();
    const { addSection } = useAdminApi();

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

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Actions admin"
                        className={cn(
                            'fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg text-white dark:text-brand-dark',
                            `bg-${module.path} hover:opacity-90`,
                        )}
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
        </>
    );
}
