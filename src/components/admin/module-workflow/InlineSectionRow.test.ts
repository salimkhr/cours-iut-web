import {describe, expect, test} from "bun:test";
import {buildSectionBriefPayload, hasBriefContent} from "@/components/admin/module-workflow/InlineSectionRow";
import type Section from "@/types/Section";

describe("buildSectionBriefPayload", () => {
    test("préserve filRougeOutcome et providedBase de la section existante quand on édite un autre champ", () => {
        // Repro Finding 1 : InlineSectionRow n'a pas de champ pour filRougeOutcome/providedBase
        // (édités par BriefsStep) — corriger juste le titre d'une section via InlineSectionRow
        // ne doit jamais les effacer.
        const existingBrief: Section["brief"] = {
            objectives: ["Comprendre X"],
            notions: ["notion A"],
            filRougeStep: "Étape 2",
            filRougeOutcome: "Le formulaire envoie une commande",
            providedBase: "Squelette HTML fourni",
        };

        const brief = buildSectionBriefPayload(existingBrief, {
            briefObjectives: "Comprendre X",
            briefNotions: "notion A",
            briefFilRougeStep: "Étape 2",
            briefNotes: "",
        });

        expect(brief.filRougeOutcome).toBe("Le formulaire envoie une commande");
        expect(brief.providedBase).toBe("Squelette HTML fourni");
    });

    test("une nouvelle section (pas de brief existant) part de filRougeOutcome vide et sans providedBase", () => {
        const brief = buildSectionBriefPayload(undefined, {
            briefObjectives: "",
            briefNotions: "",
            briefFilRougeStep: "",
            briefNotes: "",
        });

        expect(brief.filRougeOutcome).toBe("");
        expect(brief.providedBase).toBeUndefined();
    });

    test("les champs édités par ce formulaire (objectives/notions/filRougeStep/notes) écrasent bien la saisie", () => {
        const existingBrief: Section["brief"] = {
            objectives: ["ancien"],
            notions: ["ancien"],
            filRougeStep: "ancien",
            filRougeOutcome: "conservé",
        };

        const brief = buildSectionBriefPayload(existingBrief, {
            briefObjectives: "nouveau 1\nnouveau 2",
            briefNotions: "notion nouvelle",
            briefFilRougeStep: "nouvelle étape",
            briefNotes: "  une note  ",
        });

        expect(brief.objectives).toEqual(["nouveau 1", "nouveau 2"]);
        expect(brief.notions).toEqual(["notion nouvelle"]);
        expect(brief.filRougeStep).toBe("nouvelle étape");
        expect(brief.notes).toBe("une note");
        expect(brief.filRougeOutcome).toBe("conservé");
    });
});

describe("hasBriefContent", () => {
    test("faux quand tous les champs sont vides", () => {
        expect(hasBriefContent({objectives: [], notions: [], filRougeStep: "", filRougeOutcome: ""})).toBe(false);
    });

    test("vrai quand seul filRougeOutcome est renseigné", () => {
        // Repro Finding 1 (second mécanisme) : un brief qui ne porte QUE filRougeOutcome doit
        // rester envoyé, sinon la clé `brief` entière disparaît du payload.
        expect(hasBriefContent({
            objectives: [], notions: [], filRougeStep: "", filRougeOutcome: "ça tourne",
        })).toBe(true);
    });

    test("vrai quand seul providedBase est renseigné", () => {
        expect(hasBriefContent({
            objectives: [], notions: [], filRougeStep: "", filRougeOutcome: "", providedBase: "squelette",
        })).toBe(true);
    });

    test("vrai quand un objectif ou une notion est renseigné", () => {
        expect(hasBriefContent({objectives: ["a"], notions: [], filRougeStep: "", filRougeOutcome: ""})).toBe(true);
        expect(hasBriefContent({objectives: [], notions: ["a"], filRougeStep: "", filRougeOutcome: ""})).toBe(true);
    });
});
