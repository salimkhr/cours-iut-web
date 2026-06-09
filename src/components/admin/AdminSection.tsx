'use client';

import Section from "@/types/Section";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {useState} from "react";
import updateSectionState from "@/hook/admin/updateSectionState";
import EditSectionButton from "@/components/admin/EditSectionButton";
import Module from "@/types/Module";
import { getContentTypes, hasContentType } from "@/types/CourseContent";
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
    const [currentSection, setCurrentSection] = useState<Section>(section);

    const isAvailable = !!currentSection.isAvailable;
    const correctionIsAvailable = !!currentSection.correctionIsAvailable;

    const moduleId = modData._id;

    const {editSection: editSectionApi} = useAdminApi();

    const editSection = async (updatedSection: SectionFrom) => {
        const saved = await editSectionApi(modData._id as unknown as string, String(currentSection._id), updatedSection);
        setCurrentSection(saved);
    };

    const handleToggle = (
        key: keyof Pick<Section, "correctionIsAvailable" | "isAvailable" | "examenIsLock">,
        value: boolean
    ) => {
        setCurrentSection((prev) => ({...prev, [key]: value}));
        updateSectionState(moduleId, currentSection.order, key, value);
    };

    return (
        <div className="rounded-lg border p-3 space-y-3 bg-muted/40">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium leading-tight">{currentSection.order}. {currentSection.title}</h3>
                <EditSectionButton section={currentSection} modData={modData} onAdd={editSection}/>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${currentSection.path}-available`} className="text-sm">
                        {getContentTypes(currentSection.contents).map(content => content.charAt(0).toUpperCase() + content.slice(1)).join(', ')}
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
                {hasContentType(currentSection.contents, 'examen') && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-2">
                        <span>Code d&apos;accès :</span>
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