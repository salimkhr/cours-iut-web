import { describe, test, expect } from "bun:test";
import { mergeSections, buildModuleOps, buildContentOps } from "@/lib/admin/importOps";
import type { SectionData, ModuleData, ContentData } from "@/lib/admin/importOps";

describe("mergeSections", () => {
    test("une section existante conserve isAvailable/correctionIsAvailable/examenIsLock d'origine, prend le reste du payload", () => {
        const existing: SectionData[] = [{
            path: "1-intro",
            order: 1,
            title: "Ancien titre",
            isAvailable: true,
            correctionIsAvailable: true,
            examenIsLock: true,
        }];
        const imported: SectionData[] = [{
            path: "1-intro",
            order: 1,
            title: "Nouveau titre",
            isAvailable: false,
            correctionIsAvailable: false,
            examenIsLock: false,
        }];

        const merged = mergeSections(existing, imported);

        expect(merged).toHaveLength(1);
        expect(merged[0].title).toBe("Nouveau titre");
        expect(merged[0].isAvailable).toBe(true);
        expect(merged[0].correctionIsAvailable).toBe(true);
        expect(merged[0].examenIsLock).toBe(true);
    });

    test("une section nouvelle arrive isAvailable:false et correctionIsAvailable:false même si publiée sur staging", () => {
        const existing: SectionData[] = [];
        const imported: SectionData[] = [{
            path: "1-intro",
            order: 1,
            isAvailable: true,
            correctionIsAvailable: true,
        }];

        const merged = mergeSections(existing, imported);

        expect(merged).toHaveLength(1);
        expect(merged[0].isAvailable).toBe(false);
        expect(merged[0].correctionIsAvailable).toBe(false);
    });

    test("une section existante absente du payload est conservée", () => {
        const existing: SectionData[] = [{
            path: "99-prod-only",
            order: 99,
            isAvailable: true,
            correctionIsAvailable: true,
        }];
        const imported: SectionData[] = [{
            path: "1-intro",
            order: 1,
        }];

        const merged = mergeSections(existing, imported);

        const paths = merged.map((s) => s.path);
        expect(paths).toContain("99-prod-only");
        expect(paths).toContain("1-intro");
    });

    test("le résultat est trié par order croissant", () => {
        const existing: SectionData[] = [
            { path: "b", order: 5 },
        ];
        const imported: SectionData[] = [
            { path: "a", order: 2 },
            { path: "c", order: 10 },
        ];

        const merged = mergeSections(existing, imported);

        expect(merged.map((s) => s.path)).toEqual(["a", "b", "c"]);
    });
});

describe("buildModuleOps", () => {
    test("module inconnu → insertOne avec isVisible:false et sections dépubliées, inserted:1", () => {
        const modules: ModuleData[] = [{
            path: "javascript",
            title: "JavaScript",
            sections: [{ path: "1-intro", order: 1, isAvailable: true, correctionIsAvailable: true }],
        }];

        const result = buildModuleOps(new Map(), modules);

        expect(result.inserted).toBe(1);
        expect(result.updated).toBe(0);
        expect(result.operations).toHaveLength(1);

        const op = result.operations[0];
        expect("insertOne" in op).toBe(true);
        if ("insertOne" in op) {
            const doc = op.insertOne.document as Record<string, unknown>;
            expect(doc.isVisible).toBe(false);
            expect(doc.path).toBe("javascript");
            const sections = doc.sections as SectionData[];
            expect(sections[0].isAvailable).toBe(false);
            expect(sections[0].correctionIsAvailable).toBe(false);
        }
    });

    test("module connu → updateOne filtré sur { path }, applique le payload mais restaure isVisible existant, updated:1", () => {
        const existing: ModuleData = {
            path: "javascript",
            title: "Ancien titre",
            isVisible: true,
            sections: [],
        };
        const modules: ModuleData[] = [{
            path: "javascript",
            title: "Nouveau titre",
            isVisible: false,
            sections: [],
        }];

        const result = buildModuleOps(new Map([["javascript", existing]]), modules);

        expect(result.inserted).toBe(0);
        expect(result.updated).toBe(1);
        expect(result.operations).toHaveLength(1);

        const op = result.operations[0];
        expect("updateOne" in op).toBe(true);
        if ("updateOne" in op) {
            expect(op.updateOne.filter).toEqual({ path: "javascript" });
            const set = op.updateOne.update as { $set: Record<string, unknown> };
            expect(set.$set.title).toBe("Nouveau titre");
            expect(set.$set.isVisible).toBe(true);
        }
    });

    test("payload vide → aucune opération", () => {
        const result = buildModuleOps(new Map(), []);

        expect(result.operations).toHaveLength(0);
        expect(result.inserted).toBe(0);
        expect(result.updated).toBe(0);
    });
});

describe("buildContentOps", () => {
    test("une opération updateOne par contenu, upsert:true, filtre sur {moduleSlug, sectionSlug, contentType}", () => {
        const contents: ContentData[] = [{
            moduleSlug: "javascript",
            sectionSlug: "1-intro",
            contentType: "cours",
            blocks: [{ type: "text" }],
            version: 3,
        }];

        const ops = buildContentOps(contents);

        expect(ops).toHaveLength(1);
        const op = ops[0];
        expect("updateOne" in op).toBe(true);
        if ("updateOne" in op) {
            expect(op.updateOne.upsert).toBe(true);
            expect(op.updateOne.filter).toEqual({
                moduleSlug: "javascript",
                sectionSlug: "1-intro",
                contentType: "cours",
            });
            const update = op.updateOne.update as { $set: Record<string, unknown> };
            expect(update.$set.version).toBe(3);
            expect(update.$set.blocks).toEqual([{ type: "text" }]);
        }
    });

    test("version vaut 1 par défaut si absente du payload", () => {
        const contents: ContentData[] = [{
            moduleSlug: "javascript",
            sectionSlug: "1-intro",
            contentType: "cours",
            blocks: [],
        }];

        const ops = buildContentOps(contents);

        const op = ops[0];
        if ("updateOne" in op) {
            const update = op.updateOne.update as { $set: Record<string, unknown> };
            expect(update.$set.version).toBe(1);
        }
    });
});
