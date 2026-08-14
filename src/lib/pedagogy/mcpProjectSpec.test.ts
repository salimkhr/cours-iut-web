import {describe, expect, test} from "bun:test";
import {forceDraft} from "@/lib/pedagogy/mcpProjectSpec";
import type {ProjectSpec} from "@/lib/schemas/module.schema";

const input = {name: "Restaurant", pitch: "p", finalDeliverable: "d", entities: ["Order"]};

describe("forceDraft", () => {
    test("écrit toujours draft, même si l'agent demande validated", () => {
        expect(forceDraft({...input, status: "validated"}).status).toBe("draft");
    });

    test("conserve le dépôt de référence déjà en base", () => {
        const existing: ProjectSpec = {
            ...input, status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "validated"},
        };
        const out = forceDraft(input, existing);
        expect(out.referenceRepo).toEqual({url: "https://git.example/u/x", status: "validated"});
        expect(out.status).toBe("draft");
    });

    test("rejette une entrée incomplète", () => {
        expect(() => forceDraft({name: "X"})).toThrow();
    });

    test("ramène à draft un referenceRepo fraîchement soumis par l'agent", () => {
        const out = forceDraft({...input, referenceRepo: {url: "https://git.example/u/x", status: "validated"}});
        expect(out.referenceRepo).toEqual({url: "https://git.example/u/x", status: "draft"});
    });

    test("ne rétrograde jamais un referenceRepo déjà validé en base", () => {
        const existing: ProjectSpec = {
            ...input, status: "validated",
            referenceRepo: {url: "https://git.example/u/x", status: "validated"},
        };
        const out = forceDraft({...input, referenceRepo: {url: "https://git.example/u/autre", status: "validated"}}, existing);
        expect(out.referenceRepo).toEqual({url: "https://git.example/u/x", status: "validated"});
    });
});
