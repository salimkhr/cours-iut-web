'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionForm, { Section } from '@/components/admin/SectionForm';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';
import {moduleColor} from '@/lib/moduleColor';

interface AddSectionFabProps {
    module: Module;
}

export default function AddSectionFab({ module }: AddSectionFabProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { addSection } = useAdminApi();

    const handleSubmit = async (section: Section) => {
        await addSection(module._id as unknown as string, section);
        router.refresh();
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                aria-label="Ajouter une section"
                title="Ajouter une section"
                className="fixed bottom-20 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg text-white dark:text-brand-dark hover:opacity-90"
                style={{ backgroundColor: moduleColor(module) }}
            >
                <Plus className="w-5 h-5" />
            </Button>

            <SectionForm
                modData={module}
                mode="add"
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
            />
        </>
    );
}
