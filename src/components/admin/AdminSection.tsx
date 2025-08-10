'use client';

import Section from "@/types/Section";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {useEffect, useState} from "react";
import updateSectionState from "@/hook/admin/updateSectionState";
import {ObjectId} from "bson";

interface AdminSectionProps {
    section: Section;
    moduleId: string | ObjectId;

}

export default function AdminSection({
                                         section,
                                         moduleId,
                                     }: AdminSectionProps) {

    const [isAvailable, setIsAvailable] = useState(!!section.isAvailable);
    const [correctionIsAvailable, setIscorrectionIsAvailable] = useState(!!section.correctionIsAvailable);

    const handleToggle = (
        key: keyof Pick<Section, "correctionIsAvailable" | "isAvailable">,
        value: boolean
    ) => {
        if (key === "isAvailable") setIsAvailable(value);

        if (key === "correctionIsAvailable") setIscorrectionIsAvailable(value);

        updateSectionState(moduleId, section._id, key, value);
    };

    // sync avec les props si elles changent de l'extérieur
    useEffect(() => {
        setIsAvailable(!!section.isAvailable);
    }, [section.isAvailable]);

    useEffect(() => {
        setIscorrectionIsAvailable(!!section.correctionIsAvailable);
    }, [section.correctionIsAvailable]);

    return (
        <div className="rounded-lg border p-3 space-y-3 bg-muted/40">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium leading-tight">{section.order}. {section.title}</h3>
                <span className="text-sm text-muted-foreground">{section.totalDuration} Séance(s)</span>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${section._id}-available`} className="text-sm">
                        {section.contents.map(content => content).join(', ')}
                    </Label>
                    <Switch
                        id={`${section._id}-available`}
                        checked={isAvailable}
                        onCheckedChange={(checked) => handleToggle("isAvailable", !!checked)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${section._id}-correction`} className="text-sm">
                        Correction
                    </Label>
                    <Switch
                        id={`${section._id}-correction`}
                        checked={correctionIsAvailable}
                        onCheckedChange={(checked) => handleToggle("correctionIsAvailable", !!checked)}
                        disabled={!section.hasCorrection}
                    />
                </div>
            </div>
        </div>
    );
}