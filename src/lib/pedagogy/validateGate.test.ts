import {describe, expect, test} from "bun:test";
import {buildGateUpdate} from "@/lib/pedagogy/validateGate";
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
