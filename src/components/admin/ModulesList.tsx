'use client';

import {useState} from 'react';
import AdminModule from "@/components/admin/AdminModule";
import AddModuleButton from "./AddModuleButton";
import {Section} from "@/types/Section";
import {Accordion} from "@/components/ui/accordion";

interface Module {
    _id: string;
    title: string;
    path: string;
    iconName: string;
    description?: string;
    sections: Section[];
}

interface ModulesListProps {
    initialModules: Module[];
}

export default function ModulesList({initialModules}: ModulesListProps) {
    const [modules, setModules] = useState(initialModules);

    const handleAddModule = async (newMod: Omit<Module, '_id'>) => {
        try {
            const res = await fetch('/api/admin/modules', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newMod),
            });

            if (!res.ok) throw new Error('Erreur ajout module');

            const createdModule: Module = await res.json();

            setModules(prev => [...prev, createdModule]);
        } catch (error) {
            console.error(error);
            alert("Impossible d'ajouter le module");
        }
    };

    return (
        <>
            <AddModuleButton onAdd={handleAddModule}/>
            <div className="space-y-4">
                <Accordion type="single" collapsible>
                    {modules.map(mod => (
                        <AdminModule key={mod._id} module={mod}/>
                    ))}
                </Accordion>
            </div>
        </>
    );
}
