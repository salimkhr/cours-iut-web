import {describe, expect, test} from "bun:test";
import {MODULE_STEP_PROMPTS, buildModuleStepPromptMessage} from "@/lib/pedagogy/stepPrompts";
import {moduleSteps} from "@/lib/pedagogy/moduleProgress";
import type Module from "@/types/Module";

describe("MODULE_STEP_PROMPTS", () => {
    test("un prompt par étape de l'écran, dans le même ordre", () => {
        const emptyModule = {sections: [], associatedSae: []} as unknown as Module;
        const screenSteps = moduleSteps(emptyModule).map((s) => s.id);
        expect(MODULE_STEP_PROMPTS.map((p) => p.stepId)).toEqual(screenSteps);
    });

    test("des noms de prompt uniques, préfixés module_", () => {
        const ids = MODULE_STEP_PROMPTS.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.every((id) => id.startsWith("module_"))).toBe(true);
    });

    test("l'étape réglages ne référence aucun document de skill", () => {
        const reglages = MODULE_STEP_PROMPTS.find((p) => p.stepId === "reglages");
        expect(reglages?.stepLabel).toBeUndefined();
    });

    test("chaque autre étape porte le titre exact du document module-design", () => {
        const projet = MODULE_STEP_PROMPTS.find((p) => p.stepId === "projet");
        expect(projet?.stepLabel).toBe("Projet");
    });
});

describe("buildModuleStepPromptMessage", () => {
    test("nomme le module et l'étape, et interdit de déborder", () => {
        const msg = buildModuleStepPromptMessage("Projet", "rust");
        expect(msg).toContain("rust");
        expect(msg).toContain("« Projet »");
        expect(msg).toContain("module-design");
    });
});
