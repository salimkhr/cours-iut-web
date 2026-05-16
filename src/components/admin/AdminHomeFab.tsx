'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddModuleButton from '@/components/admin/AddModuleButton';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';

export default function AdminHomeFab() {
    const [addModuleOpen, setAddModuleOpen] = useState(false);
    const router = useRouter();
    const { addModule } = useAdminApi();

    const handleAdd = async (newMod: Omit<Module, '_id'>) => {
        await addModule(newMod as unknown as Omit<Module, '_id'>);
        router.refresh();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Actions admin"
                        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg bg-brand-primary text-white hover:bg-brand-accent-dark"
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
                        onClick={() => setAddModuleOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Créer un module
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AddModuleButton
                onAdd={handleAdd}
                open={addModuleOpen}
                onOpenChange={setAddModuleOpen}
            />
        </>
    );
}
