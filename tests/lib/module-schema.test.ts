import { describe, test, expect } from "bun:test";
import { moduleFormSchema } from "@/lib/schemas/module.schema";

const BASE = {
    title: "Rust",
    path: "rust",
    iconName: "Code",
    coefficients: [],
};

describe("moduleFormSchema — couleurs", () => {
    test("accepte un hex valide (light + dark)", () => {
        const r = moduleFormSchema.safeParse({ ...BASE, colorLight: "#C13B1A", colorDark: "#FF8568" });
        expect(r.success).toBe(true);
    });

    test("accepte l'absence de couleur", () => {
        const r = moduleFormSchema.safeParse(BASE);
        expect(r.success).toBe(true);
    });

    test("rejette un hex invalide", () => {
        const r = moduleFormSchema.safeParse({ ...BASE, colorLight: "red" });
        expect(r.success).toBe(false);
    });

    test("rejette un hex à 3 chiffres", () => {
        const r = moduleFormSchema.safeParse({ ...BASE, colorLight: "#fff" });
        expect(r.success).toBe(false);
    });
});

describe("moduleFormSchema — sessionDurationMinutes", () => {
    const base = {
        title: "PHP",
        path: "php",
        iconName: "Code",
        associatedSae: [],
        coefficients: [],
        instructors: [],
        isExtra: false,
    };

    test("accepte une durée entière positive", () => {
        const r = moduleFormSchema.safeParse({ ...base, sessionDurationMinutes: 150 });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.sessionDurationMinutes).toBe(150);
    });

    test("est optionnelle", () => {
        const r = moduleFormSchema.safeParse(base);
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.sessionDurationMinutes).toBeUndefined();
    });

    test("rejette zéro, négatif et non-entier", () => {
        expect(moduleFormSchema.safeParse({ ...base, sessionDurationMinutes: 0 }).success).toBe(false);
        expect(moduleFormSchema.safeParse({ ...base, sessionDurationMinutes: -30 }).success).toBe(false);
        expect(moduleFormSchema.safeParse({ ...base, sessionDurationMinutes: 90.5 }).success).toBe(false);
    });
});
