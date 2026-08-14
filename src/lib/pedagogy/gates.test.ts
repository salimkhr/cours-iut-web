import {describe, expect, test} from "bun:test";
import {canPushReference, canWriteContent, assertCanPushReference, assertCanWriteContent} from "@/lib/pedagogy/gates";
import type {ProjectSpec} from "@/lib/schemas/module.schema";

const spec = (over: Partial<ProjectSpec> = {}): ProjectSpec => ({
    name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: [], status: "draft", ...over,
});

describe("canPushReference — porte 1", () => {
    test("refuse tant que la spec projet est en brouillon", () => {
        expect(canPushReference(spec())).toBe(false);
    });
    test("autorise dès que la spec projet est validée", () => {
        expect(canPushReference(spec({status: "validated"}))).toBe(true);
    });
    test("refuse un module sans spec projet", () => {
        expect(canPushReference(undefined)).toBe(false);
    });
});

describe("canWriteContent — porte 2", () => {
    test("autorise un module migré, sans dépôt déclaré", () => {
        expect(canWriteContent(spec({status: "validated"}))).toBe(true);
        expect(canWriteContent(undefined)).toBe(true);
    });
    test("refuse dès qu'un dépôt est déclaré mais pas validé", () => {
        expect(canWriteContent(spec({
            status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "draft"},
        }))).toBe(false);
    });
    test("autorise quand le dépôt est validé", () => {
        expect(canWriteContent(spec({
            status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "validated"},
        }))).toBe(true);
    });
});

describe("assertions", () => {
    test("assertCanPushReference nomme l'étape manquante", () => {
        expect(() => assertCanPushReference(spec(), "rust"))
            .toThrow(/spec projet du module "rust" n'est pas validée/);
    });
    test("assertCanWriteContent nomme l'étape manquante", () => {
        expect(() => assertCanWriteContent(spec({
            status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "draft"},
        }), "rust")).toThrow(/dépôt de référence du module "rust" n'est pas validé/);
    });
    test("assertCanWriteContent laisse passer un module migré", () => {
        expect(() => assertCanWriteContent(undefined, "javascript")).not.toThrow();
    });
});
