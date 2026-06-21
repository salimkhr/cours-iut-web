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
