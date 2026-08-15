import {describe, expect, test} from "bun:test";
import {buildGateUpdate, guardProjectSpecOnPut, foldProjectSpecGuard} from "@/lib/pedagogy/validateGate";
import type {ProjectSpec} from "@/lib/schemas/module.schema";

const spec = (over: Partial<ProjectSpec> = {}): ProjectSpec => ({
    name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: ["Order"], status: "draft", ...over,
});

describe("buildGateUpdate", () => {
    test("valide la spec projet", () => {
        expect(buildGateUpdate("projectSpec", spec())).toEqual({"projectSpec.status": "validated"});
    });

    test("refuse de valider une spec sans livrable final", () => {
        expect(() => buildGateUpdate("projectSpec", spec({finalDeliverable: ""})))
            .toThrow(/livrable final/);
    });

    test("refuse de valider un dépôt inexistant", () => {
        expect(() => buildGateUpdate("referenceRepo", spec({status: "validated"})))
            .toThrow(/aucun dépôt de référence/);
    });

    test("refuse de valider le dépôt avant la spec", () => {
        expect(() => buildGateUpdate("referenceRepo", spec({
            referenceRepo: {url: "https://git.example/u/x", status: "draft"},
        }))).toThrow(/spec projet/);
    });

    test("valide le dépôt quand la spec l'est déjà", () => {
        expect(buildGateUpdate("referenceRepo", spec({
            status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "draft"},
        }))).toEqual({"projectSpec.referenceRepo.status": "validated"});
    });

    test("refuse un module sans spec", () => {
        expect(() => buildGateUpdate("projectSpec", undefined)).toThrow(/aucune spec projet/);
    });
});

describe("guardProjectSpecOnPut", () => {
    const base = {name: "X", pitch: "p", finalDeliverable: "d", entities: []};

    test("bloque une promotion à validated qui ne passe pas par /validate", () => {
        const out = guardProjectSpecOnPut({...base, status: "validated"}, {...base, status: "draft"});
        expect(out?.status).toBe("draft");
    });

    test("autorise la régression explicite vers draft", () => {
        const out = guardProjectSpecOnPut({...base, status: "draft"}, {...base, status: "validated"});
        expect(out?.status).toBe("draft");
    });

    test("laisse passer un statut validated inchangé", () => {
        const out = guardProjectSpecOnPut({...base, status: "validated"}, {...base, status: "validated"});
        expect(out?.status).toBe("validated");
    });

    test("ne remplace jamais un referenceRepo déjà en base", () => {
        const existing = {
            ...base, status: "validated" as const,
            referenceRepo: {url: "https://git.example/u/x", status: "validated" as const},
        };
        const out = guardProjectSpecOnPut(
            {...base, status: "validated", referenceRepo: {url: "https://git.example/u/autre", status: "validated"}},
            existing
        );
        expect(out?.referenceRepo).toEqual({url: "https://git.example/u/x", status: "validated"});
    });

    test("clampe à draft un referenceRepo fraîchement soumis sans existant", () => {
        const out = guardProjectSpecOnPut(
            {...base, status: "draft", referenceRepo: {url: "https://git.example/u/x", status: "validated"}},
            undefined
        );
        expect(out?.referenceRepo).toEqual({url: "https://git.example/u/x", status: "draft"});
    });
});

describe("foldProjectSpecGuard", () => {
    const base = {name: "X", pitch: "p", finalDeliverable: "d", entities: []};

    // Finding 2 (revue finale) : le PUT de /api/admin/modules/[moduleId] faisait
    // `{...parsed.data, projectSpec: guardProjectSpecOnPut(...)}` — quand le résultat gardé est
    // `undefined`, cette écriture réintroduit `projectSpec` comme propriété PROPRE valant
    // `undefined`. Le driver Mongo (sans `ignoreUndefined`) sérialise ça en BSON `null`, que
    // `moduleFormSchema` (optional, pas nullable) rejette au prochain PUT — panne en cascade.
    test("n'ajoute pas la clé projectSpec quand rien n'est envoyé et rien n'existe en base", () => {
        const out = foldProjectSpecGuard({title: "X"}, undefined);
        expect(Object.prototype.hasOwnProperty.call(out, "projectSpec")).toBe(false);
    });

    test("n'écrit jamais projectSpec: undefined comme propriété propre (repro du bug BSON null)", () => {
        const out = foldProjectSpecGuard({title: "X", projectSpec: undefined}, undefined);
        expect(Object.prototype.hasOwnProperty.call(out, "projectSpec")).toBe(false);
        expect(out.projectSpec).toBeUndefined();
    });

    test("préserve un projectSpec existant même si le PUT n'en envoie pas", () => {
        // guardProjectSpecOnPut(undefined, existing) renvoie `undefined` (cf. `if (!input) return
        // input`) — foldProjectSpecGuard ne doit donc PAS écrire `projectSpec: undefined` par
        // dessus l'existant : simplement omettre la clé du `$set`, laissant Mongo intact.
        const existing: ProjectSpec = {...base, status: "validated"};
        const out = foldProjectSpecGuard({title: "X", projectSpec: undefined}, existing);
        expect(Object.prototype.hasOwnProperty.call(out, "projectSpec")).toBe(false);
    });

    test("inclut la spec gardée (non promue) quand une spec est envoyée", () => {
        const out = foldProjectSpecGuard(
            {title: "X", projectSpec: {...base, status: "validated" as const}},
            undefined
        );
        expect((out.projectSpec as ProjectSpec | undefined)?.status).toBe("draft");
    });

    test("laisse passer les autres champs du PUT inchangés", () => {
        const out = foldProjectSpecGuard({title: "X", description: "d"}, undefined);
        expect(out).toEqual({title: "X", description: "d"});
    });
});
