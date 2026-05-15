'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Settings} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import Module from '@/types/Module';
import EditModuleSheet from '@/components/admin/EditModuleSheet';
import {ModuleFormValues} from '@/lib/schemas/module.schema';

interface EditModuleFabProps {
    module: Module;
}

export default function EditModuleFab({module}: EditModuleFabProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data: ModuleFormValues) => {
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

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                aria-label="Modifier le module"
                title="Modifier le module"
                className={cn(
                    'fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg',
                    `bg-${module.path} hover:opacity-90`,
                )}
            >
                <Settings className="w-5 h-5"/>
            </Button>

            <EditModuleSheet
                module={module}
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
            />
        </>
    );
}
