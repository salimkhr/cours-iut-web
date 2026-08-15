import {describe, expect, test} from "bun:test";
import {moduleToFormValues} from "@/lib/pedagogy/moduleFormValues";
import {readErrorMessage} from "@/lib/pedagogy/apiErrors";
import {moduleFormSchema, FIXED_COMPETENCES} from "@/lib/schemas/module.schema";
import type Module from "@/types/Module";

// Finding 5 (revue finale) : moduleToFormValues était dupliquée à l'identique dans CadrageStep,
// NotionsStep, ProjetStep et ReglagesStep — un nouveau champ de moduleFormSchema n'était alors
// répercuté que si les 4 copies étaient mises à jour en même temps (c'est exactement la classe
// de bug de Finding 1/2, déjà réalisée une fois). Centralisée ici ; ce test vérifie qu'AUCUN
// champ de moduleFormSchema n'est oublié en repassant le résultat au schéma lui-même.

const baseModule: Module = {
    _id: "1",
    title: "Rust",
    path: "rust",
    iconName: "Code",
    associatedSae: [],
    sections: [],
};

describe("moduleToFormValues", () => {
    test("produit des valeurs qui satisfont moduleFormSchema pour un module minimal", () => {
        const values = moduleToFormValues(baseModule);
        const parsed = moduleFormSchema.safeParse(values);
        expect(parsed.success).toBe(true);
    });

    test("couvre toutes les compétences fixes avec la valeur existante ou 0", () => {
        const mod: Module = {
            ...baseModule,
            coefficients: [{competenceName: FIXED_COMPETENCES[0], value: 42}],
        };
        const values = moduleToFormValues(mod);
        expect(values.coefficients).toHaveLength(FIXED_COMPETENCES.length);
        expect(values.coefficients.find((c) => c.competenceName === FIXED_COMPETENCES[0])?.value).toBe(42);
        expect(values.coefficients.find((c) => c.competenceName === FIXED_COMPETENCES[1])?.value).toBe(0);
    });

    test("préserve projectSpec et exampleDomain existants (Finding 1/2 : ne jamais les perdre)", () => {
        const mod: Module = {
            ...baseModule,
            projectSpec: {
                name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: [],
                status: "validated",
            },
            exampleDomain: {name: "Bibliothèque", description: "Livres"},
        };
        const values = moduleToFormValues(mod);
        expect(values.projectSpec).toEqual(mod.projectSpec);
        expect(values.exampleDomain).toEqual(mod.exampleDomain);
    });

    test("ne perd aucun champ de moduleFormSchema entre deux évolutions du schéma", () => {
        // Filet mécanique : chaque clé du schéma doit être assignée par la fonction (même à une
        // valeur par défaut) — sinon le prochain PUT écraserait ce champ pour tout module chargé
        // par une étape qui repasse par moduleToFormValues.
        const values = moduleToFormValues(baseModule);
        const schemaKeys = Object.keys(moduleFormSchema.shape);
        for (const key of schemaKeys) {
            expect(Object.prototype.hasOwnProperty.call(values, key)).toBe(true);
        }
    });
});

describe("readErrorMessage", () => {
    test("lit le message d'erreur JSON quand il est une chaîne", async () => {
        const res = new Response(JSON.stringify({error: "Non autorisé"}), {status: 403});
        expect(await readErrorMessage(res, "fallback")).toBe("Non autorisé");
    });

    test("retombe sur le fallback si error n'est pas une chaîne (ex: flatten() Zod)", async () => {
        const res = new Response(JSON.stringify({error: {fieldErrors: {}, formErrors: []}}), {status: 400});
        expect(await readErrorMessage(res, "fallback")).toBe("fallback");
    });

    test("retombe sur le fallback si le corps n'est pas du JSON valide", async () => {
        const res = new Response("not json", {status: 500});
        expect(await readErrorMessage(res, "fallback")).toBe("fallback");
    });
});
