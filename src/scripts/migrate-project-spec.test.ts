import {describe, expect, test} from "bun:test";
import {buildProjectSpecFromUniverse} from "@/scripts/migrate-project-spec";

describe("buildProjectSpecFromUniverse", () => {
    test("reprend le nom et le pitch de l'univers, en validé", () => {
        const spec = buildProjectSpecFromUniverse({name: "Netflex", description: "Catalogue de films"});
        expect(spec).toEqual({
            name: "Netflex",
            pitch: "Catalogue de films",
            finalDeliverable: "",
            entities: [],
            status: "validated",
        });
    });

    test("renvoie undefined sans univers — rien à migrer", () => {
        expect(buildProjectSpecFromUniverse(undefined)).toBeUndefined();
    });

    test("ne déclare jamais de dépôt de référence", () => {
        const spec = buildProjectSpecFromUniverse({name: "X", description: "Y"});
        expect(spec?.referenceRepo).toBeUndefined();
    });
});
