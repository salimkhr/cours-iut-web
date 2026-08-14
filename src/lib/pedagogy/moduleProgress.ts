import type Module from "@/types/Module";
import type Section from "@/types/Section";
import {getContentTypes} from "@/types/CourseContent";

export type StepId = "cadrage" | "notions" | "projet" | "reference" | "sections" | "briefs" | "reglages";
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
    reglages:  "Réglages",
};

const ORDER: StepId[] = ["cadrage", "notions", "projet", "reference", "sections", "briefs", "reglages"];

function isDone(module: Module, step: StepId): boolean {
    switch (step) {
        case "cadrage":   return Boolean(module.sessionDurationMinutes);
        case "notions":   return (module.plannedNotions?.length ?? 0) > 0;
        case "projet":    return module.projectSpec?.status === "validated";
        case "reference": return module.projectSpec?.referenceRepo?.status === "validated";
        case "sections":  return module.sections.length > 0;
        case "briefs":    return module.sections.length > 0
            && module.sections.every((section) => sectionProgress(section).brief);
        case "reglages":  return Boolean(module.exampleDomain);
    }
}

export function moduleSteps(module: Module): ModuleStep[] {
    return ORDER.map((id) => ({id, label: LABELS[id], state: isDone(module, id) ? "done" : "todo"}));
}

/** La première étape non franchie — celle que l'écran déplie au chargement. */
export function currentStepId(module: Module): StepId {
    return moduleSteps(module).find((step) => step.state === "todo")?.id ?? "reglages";
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
