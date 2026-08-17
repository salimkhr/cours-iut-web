import {describe, expect, test} from "bun:test";
import {buildSectionBriefPayload, hasBriefContent} from "@/components/admin/module-workflow/InlineSectionRow";

describe("buildSectionBriefPayload", () => {
    test("construit le brief complet à partir des six champs du formulaire", () => {
        const brief = buildSectionBriefPayload({
            briefObjectives: "Comprendre X",
            briefNotions: "notion A",
            briefFilRougeStep: "Étape 2",
            briefFilRougeOutcome: "Le formulaire envoie une commande",
            briefProvidedBase: "Squelette HTML fourni",
            briefNotes: "",
        });

        expect(brief.objectives).toEqual(["Comprendre X"]);
        expect(brief.notions).toEqual(["notion A"]);
        expect(brief.filRougeStep).toBe("Étape 2");
        expect(brief.filRougeOutcome).toBe("Le formulaire envoie une commande");
        expect(brief.providedBase).toBe("Squelette HTML fourni");
    });

    test("une nouvelle section (rien de saisi) part de champs vides et sans providedBase", () => {
        const brief = buildSectionBriefPayload({
            briefObjectives: "",
            briefNotions: "",
            briefFilRougeStep: "",
            briefFilRougeOutcome: "",
            briefProvidedBase: "",
            briefNotes: "",
        });

        expect(brief.filRougeOutcome).toBe("");
        expect(brief.providedBase).toBeUndefined();
    });

    test("chaque champ écrase bien la saisie précédente, notes/providedBase trim(é)s", () => {
        const brief = buildSectionBriefPayload({
            briefObjectives: "nouveau 1\nnouveau 2",
            briefNotions: "notion nouvelle",
            briefFilRougeStep: "nouvelle étape",
            briefFilRougeOutcome: "  nouveau résultat  ",
            briefProvidedBase: "  base fournie  ",
            briefNotes: "  une note  ",
        });

        expect(brief.objectives).toEqual(["nouveau 1", "nouveau 2"]);
        expect(brief.notions).toEqual(["notion nouvelle"]);
        expect(brief.filRougeStep).toBe("nouvelle étape");
        expect(brief.filRougeOutcome).toBe("nouveau résultat");
        expect(brief.providedBase).toBe("base fournie");
        expect(brief.notes).toBe("une note");
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
