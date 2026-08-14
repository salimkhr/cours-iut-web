import {describe, expect, test} from "bun:test";
import {buildGateUpdate, guardProjectSpecOnPut} from "@/lib/pedagogy/validateGate";
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
