import type Module from "@/types/Module";
import type Section from "@/types/Section";
import {getContentTypes} from "@/types/CourseContent";

export type StepId = "cadrage" | "notions" | "projet" | "reference" | "sections" | "briefs";
export type StepState = "todo" | "done";

export interface ModuleStep {
    id: StepId;
    label: string;
    state: StepState;
}

const LABELS: Record<StepId, string> = {
    cadrage:   "Cadrage",
    notions:   "Notions",
    projet:    "Projet",
    reference: "Référence",
    sections:  "Sections",
    briefs:    "Briefs",
};

const ORDER: StepId[] = ["cadrage", "notions", "projet", "reference", "sections", "briefs"];

function isDone(module: Module, step: StepId): boolean {
    switch (step) {
        // "cadrage" porte aussi les réglages (couleurs/coefficients/instructors/SAÉ) depuis leur
        // fusion dans cette étape — tous ont des valeurs par défaut, seule sessionDurationMinutes
        // a un critère naturel d'incomplétude.
        case "cadrage":   return Boolean(module.sessionDurationMinutes);
        case "notions":   return (module.plannedNotions?.length ?? 0) > 0;
        case "projet":    return module.projectSpec?.status === "validated";
        case "reference": return module.projectSpec?.referenceRepo?.status === "validated";
        case "sections":  return module.sections.length > 0;
        case "briefs":    return module.sections.length > 0
            && module.sections.every((section) => sectionProgress(section).brief);
    }
}

export function moduleSteps(module: Module): ModuleStep[] {
    return ORDER.map((id) => ({id, label: LABELS[id], state: isDone(module, id) ? "done" : "todo"}));
}

/** La première étape non franchie — celle que l'écran déplie au chargement. */
export function currentStepId(module: Module): StepId {
    return moduleSteps(module).find((step) => step.state === "todo")?.id ?? ORDER[ORDER.length - 1];
}

export interface SectionProgress {
    brief: boolean;
    cours: boolean;
    slide: boolean;
    tp: boolean;
    examen: boolean;
}

export function sectionProgress(section: Section): SectionProgress {
    const types = getContentTypes(section.contents);
    const brief = Boolean(section.brief?.filRougeStep?.trim() || section.brief?.filRougeOutcome?.trim());
    return {
        brief,
        cours:  types.includes("cours"),
        slide:  types.includes("slide"),
        tp:     types.includes("TP"),
        examen: types.includes("examen"),
    };
}
