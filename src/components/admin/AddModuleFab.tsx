'use client';

import {useRouter} from 'next/navigation';
import AddModuleButton from './AddModuleButton';
import useAdminApi from '@/hook/admin/useAdminApi';
import type {ModuleFormValues} from '@/lib/schemas/module.schema';

export default function AddModuleFab() {
    const router = useRouter();
    const {addModule} = useAdminApi();

    const handleAdd = async (data: ModuleFormValues) => {
        await addModule({...data, sections: []});
        router.refresh();
    };

    return <AddModuleButton onAdd={handleAdd}/>;
}
