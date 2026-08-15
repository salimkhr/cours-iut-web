import type {StepId} from "@/lib/pedagogy/moduleProgress";

export interface StepPromptDef {
    id: string;
    stepId: StepId;
    title: string;
    description: string;
    /** Titre `###` exact dans skills/module-design/main.md. */
    stepLabel: string;
}

export const MODULE_STEP_PROMPTS: StepPromptDef[] = [
    {
        id: "module_cadrage", stepId: "cadrage", stepLabel: "Cadrage",
        title: "Cadrer un nouveau module",
        description: "Matière, niveau, séances, durée de séance, et réglages (titre, icône, "
            + "couleurs, coefficients, intervenants, SAÉ) — première étape de conception.",
    },
    {
        id: "module_notions", stepId: "notions", stepLabel: "Notions",
        title: "Lister les notions à couvrir",
        description: "Progression de notions à poser avant de choisir le projet fil rouge.",
    },
    {
        id: "module_projet", stepId: "projet", stepLabel: "Projet",
        title: "Concevoir le projet fil rouge",
        description: "Spec du projet et domaine d'exemples du cours, jusqu'à la validation dans l'admin.",
    },
    {
        id: "module_reference", stepId: "reference", stepLabel: "Code de référence",
        title: "Construire le dépôt de référence",
        description: "Code le projet fil rouge complet et le pousse sur GitLab, jusqu'à la validation.",
    },
    {
        id: "module_sections", stepId: "sections", stepLabel: "Sections",
        title: "Découper en sections",
        description: "Relit le code de référence validé et propose le découpage en sections.",
    },
    {
        id: "module_briefs", stepId: "briefs", stepLabel: "Briefs",
        title: "Rédiger les briefs de section",
        description: "filRougeStep, filRougeOutcome et providedBase de chaque section.",
    },
];

/** Seed message d'un prompt d'étape : nomme le module, pointe l'agent vers la
 *  section exacte du document module-design, et lui interdit d'en déborder
 *  sans validation explicite si l'étape en comporte une. */
export function buildModuleStepPromptMessage(stepLabel: string, moduleSlug: string): string {
    return `Le module concerné est "${moduleSlug}". Chargez le document skill://pedagogy/module-design `
        + `(get_pedagogical_skill_document avec id="module-design") et exécutez UNIQUEMENT l'étape `
        + `« ${stepLabel} » de son workflow. Ne passez pas aux étapes suivantes sans validation `
        + `explicite si l'étape en comporte une.`;
}
