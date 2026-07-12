'use client';

import {useState} from 'react';
import AdminModule from "@/components/admin/AdminModule";
import AddModuleButton from "./AddModuleButton";
import {Accordion} from "@/components/ui/accordion";
import useAdminApi from "@/hook/admin/useAdminApi";
import Module from "@/types/Module";
import type {ModuleFormValues} from "@/lib/schemas/module.schema";

interface ModulesListProps {
    initialModules: Module[];
}

export default function ModulesList({initialModules}: ModulesListProps) {
    const [modules, setModules] = useState(initialModules);
    const {addModule} = useAdminApi();

    const handleAddModule = async (data: ModuleFormValues) => {
        try {
            const createdModule = await addModule({...data, sections: []});
            setModules(prev => [...prev, createdModule]);
        } catch (error) {
            console.error('Erreur ajout module', error);
            throw error;
        }
    }

    return (
        <>
            <AddModuleButton onAdd={handleAddModule}/>
            <div className="space-y-4">
                <Accordion type="single" collapsible>
                    {modules.map(mod => (
                        <AdminModule key={`${mod._id}_${mod.sections?.length}`} module={mod}/>
                    ))}
                </Accordion>
            </div>
        </>
    );
}
