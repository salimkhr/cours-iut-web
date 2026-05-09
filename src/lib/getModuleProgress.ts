import Module from "@/types/Module";
import Section from "@/types/Section";

export interface ModuleProgress {
    totalSections: number;
    totalAvailableSections: number;
    progress: number;
    hasAvailableContent: boolean;
}

export default function getModuleProgress(currentModule: Module): ModuleProgress {
    const nonExamenSections = (currentModule.sections ?? []).filter(
        (s: Section) => !s.contents.includes('examen')
    );

    const totalSections = nonExamenSections.length;
    const totalAvailableSections = nonExamenSections.filter((s) => s.isAvailable).length;

    const totalDuration = nonExamenSections.reduce(
        (sum, s) => sum + (s.totalDuration || 1),
        0
    );
    const availableDuration = nonExamenSections
        .filter((s) => s.isAvailable)
        .reduce((sum, s) => sum + (s.totalDuration || 1), 0);

    const progress = totalDuration > 0
        ? Math.round((availableDuration / totalDuration) * 100)
        : 0;

    return {
        totalSections,
        totalAvailableSections,
        progress,
        hasAvailableContent: totalAvailableSections > 0,
    };
}
