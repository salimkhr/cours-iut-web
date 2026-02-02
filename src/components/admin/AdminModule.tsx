'use client';

import {useState} from 'react';
import {AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import Module from "@/types/Module";
import AdminSection from "@/components/admin/AdminSection";
import {BookOpen} from "lucide-react";
import AddSectionButton from "@/components/admin/AddSectionButton";
import {cn} from "@/lib/utils";
import Heading from "@/components/ui/Heading";
import iconMap from "@/lib/iconMap";
import {Section} from "@/components/admin/SectionForm";
import useAdminApi from "@/hook/admin/useAdminApi";

interface AdminModuleProps {
    module: Module;
}

export default function AdminModule({module}: AdminModuleProps) {
    const [modData, setModData] = useState(module);

    const Icon = iconMap[modData.iconName] || BookOpen;

    const {addSection: addSectionApi} = useAdminApi();

    // Exemple : fonction pour ajouter une section
    const addSection = async (section: Section) => {
        const savedSection = await addSectionApi(modData._id as unknown as string, section);
        setModData(prev => ({
            ...prev,
            sections: [...prev.sections, savedSection]
        }));
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
                        {modData.sections.sort((s1, s2) => s1.order - s2.order).map(sec => (
                            <AdminSection
                                modData={modData}
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