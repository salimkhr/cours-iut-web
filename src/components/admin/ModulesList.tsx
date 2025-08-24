'use client';

import {useState} from 'react';
import AdminModule from "@/components/admin/AdminModule";
import AddModuleButton from "./AddModuleButton";
import {Accordion} from "@/components/ui/accordion";
import useAdminApi from "@/hook/admin/useAdminApi";
import Module from "@/types/module";

interface ModulesListProps {
    initialModules: Module[];
}

export default function ModulesList({initialModules}: ModulesListProps) {
    const [modules, setModules] = useState(initialModules);
    const { addModule } = useAdminApi();

    const handleAddModule = async (newMod: Omit<Module, '_id'>) => {
        try {
            const createdModule = await addModule(newMod as unknown as Omit<Module, '_id'>);
            setModules(prev => [...prev, createdModule]);
        } catch (error) {
            console.error('Erreur ajout module', error);
            throw error; // ou gestion spécifique de l'erreur
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
