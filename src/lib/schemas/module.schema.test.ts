import {describe, expect, test} from "bun:test";
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
    test("accepte un univers complet", () => {
        const r = universeSchema.safeParse({
            name: "Netflex",
            description: "Catalogue de films : title, year, genre, rating",
            scope: "module",
        });
        expect(r.success).toBe(true);
    });

    test("rejette un scope inconnu", () => {
        const r = universeSchema.safeParse({
            name: "Netflex",
            description: "Catalogue de films",
            scope: "annuel",
        });
        expect(r.success).toBe(false);
    });

    test("rejette un scope inconnu avec message français", () => {
        const r = universeSchema.safeParse({
            name: "Netflex",
            description: "Catalogue de films",
            scope: "annuel",
        });
        expect(r.success).toBe(false);
        if (!r.success) {
            expect(r.error.issues[0].message).toContain("Scope invalide");
        }
    });

    test("rejette un nom vide", () => {
        const r = universeSchema.safeParse({
            name: "",
            description: "Catalogue de films",
            scope: "tp",
        });
        expect(r.success).toBe(false);
    });

    test("rejette un nom avec espaces seuls (trim)", () => {
        const r = universeSchema.safeParse({
            name: "   ",
            description: "Catalogue de films",
            scope: "tp",
        });
        expect(r.success).toBe(false);
    });
});

describe("moduleFormSchema.universe", () => {
    test("universe est optionnel", () => {
        const r = moduleFormSchema.safeParse(baseModule);
        expect(r.success).toBe(true);
    });

    test("accepte un module avec universe", () => {
        const r = moduleFormSchema.safeParse({
            ...baseModule,
            universe: {name: "Netflex", description: "Films", scope: "module"},
        });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.universe?.scope).toBe("module");
    });
});
