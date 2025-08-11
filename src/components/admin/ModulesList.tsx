'use client';

import {useState} from 'react';
import AdminModule from "@/components/admin/AdminModule";
import AddModuleButton from "./AddModuleButton";
import Section from "@/types/Section";
import {Accordion} from "@/components/ui/accordion";
import Coefficient from "@/types/Coefficient";
import Instructor from "@/types/Instructor";
import axios from "axios";

interface Module {
    _id: string;
    title: string;
    path: string;
    iconName: string;
    description?: string;
    sections: Section[];
    associatedSae: string[];
    coefficients?: Coefficient[];
    manager?: Instructor;
    instructors?: Instructor[];
}

interface ModulesListProps {
    initialModules: Module[];
}

export default function ModulesList({initialModules}: ModulesListProps) {
    const [modules, setModules] = useState(initialModules);
    const handleAddModule = async (newMod: Omit<Module, '_id'>) => {
        try {
            const res = await axios.post('/api/admin/modules', newMod, {
                headers: {'Content-Type': 'application/json'},
            });

            // Axios parse automatiquement la réponse JSON dans res.data
            const createdModule: Module = res.data;

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
                        <AdminModule key={`${mod._id}_${mod.sections.length}`} module={mod}/>
                    ))}
                </Accordion>
            </div>
        </>
    );
}
