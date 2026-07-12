'use client';

import React, {useState} from 'react';
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
import {moduleColor} from "@/lib/moduleColor";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {toast} from "sonner";

interface AdminModuleProps {
    module: Module;
}

export default function AdminModule({module}: AdminModuleProps) {
    const [modData, setModData] = useState(module);
    const [visible, setVisible] = useState(module.isVisible !== false);

    const Icon = iconMap[modData.iconName] || BookOpen;

    const {addSection: addSectionApi, toggleModuleVisibility} = useAdminApi();

    const handleToggleVisibility = async (checked: boolean) => {
        setVisible(checked);
        try {
            await toggleModuleVisibility(modData._id as string, checked);
            toast.success(checked ? 'Module visible.' : 'Module masqué.');
        } catch {
            setVisible(!checked);
            toast.error('Erreur lors de la mise à jour de la visibilité.');
        }
    };

    const addSection = async (section: Section) => {
        const savedSection = await addSectionApi(modData._id as unknown as string, section);
        setModData(prev => ({
            ...prev,
            sections: [...prev.sections, savedSection]
        }));
    };

    const handleDeleteSection = (sectionPath: string) => {
        setModData(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.path !== sectionPath),
        }));
    };

    return (
        <AccordionItem value={modData.path}>
            <AccordionTrigger className="flex items-center">
                <div className="flex items-center p-2" style={{ color: moduleColor(modData) }}>
                    <Icon className="w-6 h-6 mr-2"/>
                    <Heading level={3}>{modData.title}</Heading>
                </div>
            </AccordionTrigger>
            <AccordionContent
                className={cn("p-0", "header-module")}
                style={{ "--module-color": moduleColor(modData) } as React.CSSProperties}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-bridge-500/20">
                    <Label htmlFor={`${modData.path}-visible`} className="text-sm cursor-pointer">
                        Visible pour les étudiants
                    </Label>
                    <Switch
                        id={`${modData.path}-visible`}
                        checked={visible}
                        onCheckedChange={handleToggleVisibility}
                    />
                </div>
                <AddSectionButton onAdd={addSection} modData={modData}/>
                {modData.sections.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                        {modData.sections.sort((s1, s2) => s1.order - s2.order).map(sec => (
                            <AdminSection
                                modData={modData}
                                key={sec.path}
                                section={sec}
                                onDelete={handleDeleteSection}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-sm text-muted-foreground">
                        Aucun cours disponible pour ce module.
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}