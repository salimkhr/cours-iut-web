import {describe, expect, test} from "bun:test";
import {moduleSteps, currentStepId, sectionProgress} from "@/lib/pedagogy/moduleProgress";
import type Module from "@/types/Module";
import type Section from "@/types/Section";

const emptyModule = {
    _id: "1", title: "Rust", path: "rust", iconName: "Code",
    sections: [], associatedSae: [],
} as unknown as Module;

const fullModule = {
    ...emptyModule,
    sessionDurationMinutes: 90,
    plannedNotions: ["ownership", "traits"],
    projectSpec: {
        name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: ["Order"],
        status: "validated" as const,
        referenceRepo: {url: "https://git.example/u/x", status: "validated" as const},
    },
    exampleDomain: {name: "Bibliothèque", description: "Livres"},
    sections: [{
        title: "Bases", path: "bases", order: 1, totalDuration: 2, contents: [], tags: [],
        hasCorrection: false,
        brief: {objectives: [], notions: [], filRougeStep: "x", filRougeOutcome: "y"},
    } as unknown as Section],
} as unknown as Module;

describe("moduleSteps", () => {
    test("tout est à faire sur un module vide, sauf réglages (pas de critère d'incomplétude)", () => {
        // Finding 6 (revue finale) : "reglages" n'édite que des champs à valeur par défaut
        // (couleurs, coefficients, instructors, SAÉ) — cette étape est toujours "done", y compris
        // sur un module qui vient d'être créé ou migré sans exampleDomain.
        const steps = moduleSteps(emptyModule);
        expect(steps.map((s) => s.id)).toEqual(
            ["cadrage", "notions", "projet", "reference", "sections", "briefs", "reglages"]
        );
        expect(steps.filter((s) => s.state === "done").map((s) => s.id)).toEqual(["reglages"]);
    });

    test("tout est fait sur un module complet", () => {
        expect(moduleSteps(fullModule).every((s) => s.state === "done")).toBe(true);
    });

    test("le projet reste à faire tant que la spec est en brouillon", () => {
        const mod = {...fullModule, projectSpec: {...fullModule.projectSpec!, status: "draft" as const}};
        const steps = moduleSteps(mod as Module);
        expect(steps.find((s) => s.id === "projet")?.state).toBe("todo");
    });

    test("réglages reste \"done\" même sans exampleDomain (module migré, jamais passé par Projet)", () => {
        const mod = {...emptyModule, exampleDomain: undefined};
        const steps = moduleSteps(mod as Module);
        expect(steps.find((s) => s.id === "reglages")?.state).toBe("done");
    });
});

describe("currentStepId", () => {
    test("pointe la première étape non franchie", () => {
        expect(currentStepId(emptyModule)).toBe("cadrage");
    });

    test("pointe le projet quand cadrage et notions sont faits", () => {
        const mod = {...emptyModule, sessionDurationMinutes: 90, plannedNotions: ["a"]} as Module;
        expect(currentStepId(mod)).toBe("projet");
    });

    test("retombe sur les réglages quand tout est fait", () => {
        expect(currentStepId(fullModule)).toBe("reglages");
    });
});

describe("sectionProgress", () => {
    test("marque le brief dès que le fil rouge est renseigné", () => {
        const section = {
            contents: [], brief: {objectives: [], notions: [], filRougeStep: "x", filRougeOutcome: "y"},
        } as unknown as Section;
        expect(sectionProgress(section).brief).toBe(true);
    });

    test("un brief sans étape fil rouge ne compte pas", () => {
        const section = {
            contents: [], brief: {objectives: [], notions: [], filRougeStep: "", filRougeOutcome: ""},
        } as unknown as Section;
        expect(sectionProgress(section).brief).toBe(false);
    });
});
