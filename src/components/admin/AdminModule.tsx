'use client';

import {useState} from 'react';
import {AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import Module from "@/types/module";
import AdminSection from "@/components/admin/AdminSection";
import {BookOpen} from "lucide-react";
import AddSectionButton from "@/components/admin/AddSectionButton";
import {cn} from "@/lib/utils";
import Heading from "@/components/ui/Heading";
import iconMap from "@/lib/iconMap";

interface AdminModuleProps {
    module: Module;
}

export default function AdminModule({module}: AdminModuleProps) {
    const [modData, setModData] = useState(module);

    const Icon = iconMap[modData.iconName] || BookOpen;

    // Exemple : fonction pour ajouter une section
    const addSection = async (section: {
        title: string;
        path: string;
        iconName: string;
        description?: string;
        totalDuration: number;
        hasCorrection: boolean;
        isAvailable: boolean;
        correctionIsAvailable: boolean;
        order: number;
        contents: string[];
    }) => {
        try {

            const res = await fetch(`/api/admin/${modData._id}/sections`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(section)
            });

            if (!res.ok) throw new Error('Erreur API');

            const {section: savedSection} = await res.json();

            setModData(prev => ({
                ...prev,
                sections: [...prev.sections, savedSection]
            }));
        } catch (err) {
            console.error('Erreur ajout section:', err);
        }
    };

    return (
        <AccordionItem value={modData.path}>
            <AccordionTrigger className="flex items-center">
                <div className={cn("flex items-center p-2", `text-${modData.path}`)}>
                    <Icon className="w-6 h-6 mr-2"/>
                    <Heading level={3}>{modData.title}</Heading>
                </div>
            </AccordionTrigger>
            <AccordionContent className={cn("p-0", `header-${modData.path}`)}>
                <AddSectionButton onAdd={addSection} modData={modData}/>
                {modData.sections.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                        {modData.sections.map(sec => (
                            <AdminSection
                                moduleId={modData._id}
                                key={sec.path}
                                section={sec}
                            />
                        ))}</div>) : (
                    <div className="text-center text-sm text-muted-foreground">
                        Aucun cours disponible pour ce module.
                    </div>
                )
                }

            </AccordionContent>
        </AccordionItem>
    );
}