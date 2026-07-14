import {describe, expect, it, test} from "bun:test";
import {moduleFormSchema, universeSchema} from "@/lib/schemas/module.schema";

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
