import Module from "@/types/Module";
import Section from "@/types/Section";
import { hasContentType } from "@/types/CourseContent";

export interface ModuleProgress {
    totalSections: number;
    totalAvailableSections: number;
    progress: number;
    hasAvailableContent: boolean;
    lastAvailableSectionPath: string | null;
}

export default function getModuleProgress(currentModule: Module): ModuleProgress {
    const nonExamenSections = (currentModule.sections ?? []).filter(
        (s: Section) => !hasContentType(s.contents, 'examen')
    );

    const totalSections = nonExamenSections.length;
    const availableSections = nonExamenSections.filter((s) => s.isAvailable);
    const totalAvailableSections = availableSections.length;

    const totalDuration = nonExamenSections.reduce(
        (sum, s) => sum + (s.totalDuration || 1),
        0
    );
    const availableDuration = availableSections.reduce(
        (sum, s) => sum + (s.totalDuration || 1),
        0
    );

    const progress = totalDuration > 0
        ? Math.round((availableDuration / totalDuration) * 100)
        : 0;

    const lastAvailable = availableSections
        .slice()
        .sort((a, b) => b.order - a.order)[0];

    return {
        totalSections,
        totalAvailableSections,
        progress,
        hasAvailableContent: totalAvailableSections > 0,
        lastAvailableSectionPath: lastAvailable?.path ?? null,
    };
}
