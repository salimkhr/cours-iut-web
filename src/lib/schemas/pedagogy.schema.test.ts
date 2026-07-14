import { describe, it, expect } from "bun:test";
import { addVerdictSchema, promoteExemplarSchema } from "./pedagogy.schema";

describe("addVerdictSchema", () => {
    it("accepte un verdict avec format contenu", () => {
        const r = addVerdictSchema.safeParse({ format: "TP", verdict: "Les exercices sont trop courts, 40 min pour 150 min de budget" });
        expect(r.success).toBe(true);
    });

    it("accepte le format module-design", () => {
        const r = addVerdictSchema.safeParse({ format: "module-design", verdict: "Trop de sections théoriques en début de module", moduleSlug: "rust" });
        expect(r.success).toBe(true);
    });

    it("rejette un verdict vide", () => {
        expect(addVerdictSchema.safeParse({ format: "cours", verdict: "  " }).success).toBe(false);
    });

    it("rejette un format inconnu", () => {
        expect(addVerdictSchema.safeParse({ format: "quiz", verdict: "x" }).success).toBe(false);
    });
});

describe("promoteExemplarSchema", () => {
    it("accepte une promotion complète", () => {
        const r = promoteExemplarSchema.safeParse({
            module: "javascript", section: "1-le-dom", type: "TP",
            level: "debutant", annotations: ["Les consignes donnent le fichier ET le résultat verbatim"],
        });
        expect(r.success).toBe(true);
    });

    it("rejette module-design comme format d'exemplaire", () => {
        const r = promoteExemplarSchema.safeParse({
            module: "javascript", section: "1-le-dom", type: "module-design",
            level: "debutant", annotations: ["ok"],
        });
        expect(r.success).toBe(false);
    });

    it("exige au moins une annotation", () => {
        const r = promoteExemplarSchema.safeParse({
            module: "javascript", section: "1-le-dom", type: "TP",
            level: "debutant", annotations: [],
        });
        expect(r.success).toBe(false);
    });
});
