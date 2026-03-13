'use client';

import Section from "@/types/Section";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {useEffect, useState} from "react";
import updateSectionState from "@/hook/admin/updateSectionState";
import EditSectionButton from "@/components/admin/EditSectionButton";
import Module from "@/types/Module";
import {Section as SectionFrom} from "@/components/admin/SectionForm";
import useAdminApi from "@/hook/admin/useAdminApi";

interface AdminSectionProps {
    section: Section;
    modData: Module;

}

export default function AdminSection({
                                         section,
                                         modData,
                                     }: AdminSectionProps) {

    const [isAvailable, setIsAvailable] = useState(!!section.isAvailable);
    const [correctionIsAvailable, setIscorrectionIsAvailable] = useState(!!section.correctionIsAvailable);
    const [examenIsLock, setExamenIsLock] = useState(!!section.examenIsLock);

    const moduleId = modData._id;

    const [currentSection, setCurrentSection] = useState<Section>(section)

    const {editSection: editSectionApi} = useAdminApi();

    const editSection = async (updatedSection: SectionFrom) => {
        const saved = await editSectionApi(modData._id as unknown as string, updatedSection);
        setCurrentSection(saved);
    };

    const handleToggle = (
        key: keyof Pick<Section, "correctionIsAvailable" | "isAvailable" | "examenIsLock">,
        value: boolean
    ) => {
        if (key === "isAvailable") setIsAvailable(value);

        if (key === "correctionIsAvailable") setIscorrectionIsAvailable(value);
        if (key === "examenIsLock") setExamenIsLock(value);
        updateSectionState(moduleId, section.order, key, value);
    };

    // sync avec les props si elles changent de l'extérieur
    useEffect(() => {
        setIsAvailable(!!currentSection.isAvailable);
    }, [currentSection.isAvailable]);

    useEffect(() => {
        setIscorrectionIsAvailable(!!currentSection.correctionIsAvailable);
    }, [currentSection.correctionIsAvailable]);

    useEffect(() => {
        setExamenIsLock(!!currentSection.examenIsLock);
    }, [currentSection.examenIsLock]);

    return (
        <div className="rounded-lg border p-3 space-y-3 bg-muted/40">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium leading-tight">{currentSection.order}. {currentSection.title}</h3>
                <EditSectionButton section={currentSection} modData={modData} onAdd={editSection}/>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${currentSection.path}-available`} className="text-sm">
                        {currentSection.contents.map(content => content.charAt(0).toUpperCase() + content.slice(1)).join(', ')}
                    </Label>
                    <Switch
                        id={`${currentSection.path}-available`}
                        checked={isAvailable}
                        onCheckedChange={(checked) => handleToggle("isAvailable", !!checked)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${currentSection._id}-correction`} className="text-sm">
                        Correction
                    </Label>
                    <Switch
                        id={`${section._id}-correction`}
                        checked={correctionIsAvailable}
                        onCheckedChange={(checked) => handleToggle("correctionIsAvailable", !!checked)}
                        disabled={!currentSection.hasCorrection}
                    />
                </div>
                {currentSection.contents.includes('examen') && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-2">
                        <span>Code d'accès :</span>
                        <code
                            className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-primary">
                            {modData._id?.toString().slice(-6).toUpperCase()}
                        </code>
                    </div>
                )}
            </div>
        </div>
    );
}