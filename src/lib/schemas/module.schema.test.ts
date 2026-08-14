import {describe, expect, it, test} from "bun:test";
import {moduleFormSchema, universeSchema, projectSpecSchema, exampleDomainSchema} from "@/lib/schemas/module.schema";

const baseModule = {
    title: "PHP",
    path: "php",
    iconName: "Code",
    associatedSae: [],
    coefficients: [],
    instructors: [],
};

describe("universeSchema", () => {
    it("universe valide sans scope", () => {
        const r = universeSchema.safeParse({ name: "Netflex", description: "catalogue de films : title, year, genre, rating" });
        expect(r.success).toBe(true);
    });

    it("universe rejette un scope résiduel (strip silencieux interdit ? non : Zod object non-strict l'ignore)", () => {
        const r = universeSchema.safeParse({ name: "Netflex", description: "catalogue", scope: "module" });
        expect(r.success).toBe(true); // champ inconnu ignoré à l'écriture, pas d'erreur
        if (r.success) expect("scope" in r.data).toBe(false);
    });

    test("rejette un nom vide", () => {
        const r = universeSchema.safeParse({
            name: "",
            description: "Catalogue de films",
        });
        expect(r.success).toBe(false);
    });

    test("rejette un nom avec espaces seuls (trim)", () => {
        const r = universeSchema.safeParse({
            name: "   ",
            description: "Catalogue de films",
        });
        expect(r.success).toBe(false);
    });
});

describe("moduleFormSchema.universe", () => {
    test("universe est optionnel", () => {
        const r = moduleFormSchema.safeParse(baseModule);
        expect(r.success).toBe(true);
    });

    test("accepte un module avec universe sans scope", () => {
        const r = moduleFormSchema.safeParse({
            ...baseModule,
            universe: {name: "Netflex", description: "Films"},
        });
        expect(r.success).toBe(true);
        if (r.success) expect("scope" in (r.data.universe ?? {})).toBe(false);
    });
});

describe("projectSpecSchema", () => {
    test("accepte une spec complète en brouillon", () => {
        const parsed = projectSpecSchema.parse({
            name: "Gestion de restaurant",
            pitch: "Une application de prise de commandes en salle",
            finalDeliverable: "Un CLI qui enregistre les commandes et édite l'addition",
            entities: ["Order", "Table", "Plat"],
        });
        expect(parsed.status).toBe("draft");
        expect(parsed.referenceRepo).toBeUndefined();
    });

    test("refuse un status inconnu", () => {
        const result = projectSpecSchema.safeParse({
            name: "X", pitch: "Y", finalDeliverable: "Z", entities: [], status: "publie",
        });
        expect(result.success).toBe(false);
    });

    test("porte le dépôt de référence avec son propre statut", () => {
        const parsed = projectSpecSchema.parse({
            name: "X", pitch: "Y", finalDeliverable: "Z", entities: [],
            referenceRepo: {url: "https://git.example/u/projet-reference-rust"},
        });
        expect(parsed.referenceRepo?.status).toBe("draft");
    });
});

describe("exampleDomainSchema", () => {
    test("exige un nom et une description", () => {
        expect(exampleDomainSchema.safeParse({name: "", description: "x"}).success).toBe(false);
        expect(exampleDomainSchema.safeParse({name: "Bibliothèque", description: "Livres, emprunts"}).success).toBe(true);
    });
});

describe("moduleFormSchema", () => {
    test("plannedNotions vaut [] par défaut", () => {
        const parsed = moduleFormSchema.parse({
            title: "Rust", path: "rust", iconName: "Code", coefficients: [],
        });
        expect(parsed.plannedNotions).toEqual([]);
    });
});
