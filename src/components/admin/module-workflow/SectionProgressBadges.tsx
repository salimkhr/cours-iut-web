"use client";

import {Badge} from "@/components/ui/badge";
import type {SectionProgress} from "@/lib/pedagogy/moduleProgress";

interface SectionProgressBadgesProps {
    progress: SectionProgress;
}

interface BadgeItem {
    key: keyof SectionProgress;
    label: string;
    presentTitle: string;
    missingTitle: string;
}

// Un badge par support pédagogique. La couleur (variant) ne porte jamais l'information seule :
// chaque badge garde son libellé texte et un `title` explicite au survol/lecteur d'écran.
const ITEMS: BadgeItem[] = [
    {key: "brief", label: "Brief", presentTitle: "Brief rédigé", missingTitle: "Brief à rédiger"},
    {key: "cours", label: "Cours", presentTitle: "Cours rédigé", missingTitle: "Cours à rédiger"},
    {key: "slide", label: "Slides", presentTitle: "Slides rédigées", missingTitle: "Slides à rédiger"},
    {key: "tp", label: "TP", presentTitle: "TP rédigé", missingTitle: "TP à rédiger"},
    {key: "examen", label: "Examen", presentTitle: "Examen rédigé", missingTitle: "Examen à rédiger"},
];

export default function SectionProgressBadges({progress}: SectionProgressBadgesProps) {
    return (
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Avancement des supports de la section">
            {ITEMS.map(({key, label, presentTitle, missingTitle}) => {
                const present = progress[key];
                return (
                    <Badge
                        key={key}
                        variant={present ? "default" : "outline"}
                        title={present ? presentTitle : missingTitle}
                    >
                        {label}
                    </Badge>
                );
            })}
        </div>
    );
}
