'use client';

import {useEffect, useState} from "react";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {Section} from "@/types/Section";

interface AdminSectionProps {
    section: Section;
    moduleId: string;
    onToggle?: (
        moduleId: string,
        sectionId: string,
        key: keyof Pick<Section, "isAvailable" | "correctionIsAvailable">,
        newValue: boolean
    ) => void;
}

export function AdminSection({
                                 section,
                                 moduleId,
                                 onToggle,
                             }: AdminSectionProps) {
    // local state pour rendre le switch réactif immédiatement
    const [isAvailable, setIsAvailable] = useState(!!section.isAvailable);
    const [hasCorrection, setHasCorrection] = useState(!!section.correctionIsAvailable);

    // sync avec les props si elles changent de l'extérieur
    useEffect(() => {
        setIsAvailable(!!section.isAvailable);
    }, [section.isAvailable]);

    useEffect(() => {
        setHasCorrection(!!section.correctionIsAvailable);
    }, [section.correctionIsAvailable]);

    // gestion du toggle avec update local + callback parent
    const handleToggle = (
        key: keyof Pick<Section, "correctionIsAvailable" | "isAvailable">,
        value: boolean
    ) => {
        if (key === "isAvailable") setIsAvailable(value);
        if (key === "correctionIsAvailable") setHasCorrection(value);
        onToggle?.(moduleId, section.id, key, value);
    };

    return (
        <div className="rounded-lg border p-3 space-y-3 bg-muted/40">
            <div>
                <h3 className="text-xl font-medium leading-tight">{section.title}</h3>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${section.id}-available`} className="text-sm">
                        Disponible
                    </Label>
                    <Switch
                        id={`${section.id}-available`}
                        checked={isAvailable}
                        onCheckedChange={(checked) => handleToggle("isAvailable", !!checked)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${section.id}-correction`} className="text-sm">
                        Correction
                    </Label>
                    <Switch
                        id={`${section.id}-correction`}
                        checked={hasCorrection}
                        onCheckedChange={(checked) => handleToggle("correctionIsAvailable", !!checked)}
                    />
                </div>
            </div>
        </div>
    );
}
