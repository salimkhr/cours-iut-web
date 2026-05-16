'use client';

import { useRouter } from 'next/navigation';
import AddModuleButton from './AddModuleButton';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';

export default function AddModuleFab() {
    const router = useRouter();
    const { addModule } = useAdminApi();

    const handleAdd = async (newMod: Omit<Module, '_id'>) => {
        await addModule(newMod as unknown as Omit<Module, '_id'>);
        router.refresh();
    };

    return <AddModuleButton onAdd={handleAdd} />;
}
