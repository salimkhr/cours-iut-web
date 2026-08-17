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
    test("tout est à faire sur un module vide", () => {
        const steps = moduleSteps(emptyModule);
        expect(steps.map((s) => s.id)).toEqual(
            ["cadrage", "notions", "projet", "reference", "sections"]
        );
        expect(steps.filter((s) => s.state === "done")).toHaveLength(0);
    });

    test("tout est fait sur un module complet", () => {
        expect(moduleSteps(fullModule).every((s) => s.state === "done")).toBe(true);
    });

    test("le projet reste à faire tant que la spec est en brouillon", () => {
        const mod = {...fullModule, projectSpec: {...fullModule.projectSpec!, status: "draft" as const}};
        const steps = moduleSteps(mod as Module);
        expect(steps.find((s) => s.id === "projet")?.state).toBe("todo");
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

    test("retombe sur la dernière étape (sections) quand tout est fait", () => {
        expect(currentStepId(fullModule)).toBe("sections");
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
