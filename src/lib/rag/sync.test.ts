import {test, expect, describe, beforeEach} from "bun:test";
import {syncContents, type IndexableContent, type VectorStore} from "@/lib/rag/sync";
import type {QdrantPoint} from "@/lib/rag/qdrant";
import type {Block} from "@/types/CourseContent";

const section = (id: string, title: string, content: string): Block =>
    ({id, type: "section", props: {title}, children: [{id: `${id}-t`, type: "text", props: {content}}]}) as Block;

function content(sectionSlug: string, blocks: Block[], updatedAt: Date, moduleVisible = true): IndexableContent {
    return {
        moduleSlug: "php", moduleTitle: "PHP", moduleVisible,
        sectionSlug, sectionTitle: sectionSlug, contentType: "cours", blocks, updatedAt,
    };
}

/** Qdrant en mémoire : garde les points par id. */
function memoryStore() {
    const points = new Map<string, QdrantPoint>();
    const store: VectorStore = {
        async list() {
            return [...points.values()].map(p => ({id: p.id, payload: p.payload}));
        },
        async upsert(batch) {
            for (const p of batch) points.set(p.id, p);
        },
        async remove(ids) {
            for (const id of ids) points.delete(id);
        },
    };
    return {store, points};
}

let embedded: string[];
const embed = async (texts: string[]) => {
    embedded.push(...texts);
    return {vectors: texts.map(t => [t.length]), tokens: texts.length * 10};
};

const hier = new Date("2026-11-06");
const derniereSynchro = new Date("2026-11-07T10:00:00");
const ensuite = new Date("2026-11-07T12:00:00");

beforeEach(() => {
    embedded = [];
});

describe("syncContents", () => {
    test("sans synchro précédente, indexe tout", async () => {
        const {store, points} = memoryStore();
        const report = await syncContents({
            contents: [content("1-tableaux", [section("a", "A", "texte a"), section("b", "B", "texte b")], hier)],
            since: null, store, embed,
        });

        expect(points.size).toBe(2);
        expect(Object.keys([...points.values()][0].payload)).not.toContain("blocks");
        expect(report).toEqual({contentsChecked: 1, chunksEmbedded: 2, chunksUnchanged: 0, pointsDeleted: 0, tokens: 20});
    });

    test("ne relit pas un contenu inchangé depuis la dernière synchro", async () => {
        const {store} = memoryStore();
        const contents = [content("1-tableaux", [section("a", "A", "texte a")], hier)];
        await syncContents({contents, since: null, store, embed});
        embedded = [];

        const report = await syncContents({contents, since: derniereSynchro, store, embed});

        expect(report.contentsChecked).toBe(0);
        expect(embedded).toEqual([]);
    });

    test("dans un contenu modifié, ne revectorise que les morceaux qui ont changé", async () => {
        const {store} = memoryStore();
        await syncContents({
            contents: [content("1-tableaux", [section("a", "A", "texte a"), section("b", "B", "texte b")], hier)],
            since: null, store, embed,
        });
        embedded = [];

        const report = await syncContents({
            contents: [content("1-tableaux", [section("a", "A", "texte a"), section("b", "B", "texte b corrigé")], ensuite)],
            since: derniereSynchro, store, embed,
        });

        expect(embedded).toHaveLength(1);
        expect(embedded[0]).toContain("texte b corrigé");
        expect(report).toMatchObject({contentsChecked: 1, chunksEmbedded: 1, chunksUnchanged: 1});
    });

    test("supprime les morceaux disparus d'un contenu raccourci", async () => {
        const {store, points} = memoryStore();
        await syncContents({
            contents: [content("1-tableaux", [section("a", "A", "texte a"), section("b", "B", "texte b")], hier)],
            since: null, store, embed,
        });

        const report = await syncContents({
            contents: [content("1-tableaux", [section("a", "A", "texte a")], ensuite)],
            since: derniereSynchro, store, embed,
        });

        expect(points.size).toBe(1);
        expect(report.pointsDeleted).toBe(1);
    });

    test("supprime les points d'un contenu qui n'existe plus", async () => {
        const {store, points} = memoryStore();
        await syncContents({
            contents: [
                content("1-tableaux", [section("a", "A", "texte a")], hier),
                content("2-objets", [section("b", "B", "texte b")], hier),
            ],
            since: null, store, embed,
        });

        const report = await syncContents({
            contents: [content("1-tableaux", [section("a", "A", "texte a")], hier)],
            since: derniereSynchro, store, embed,
        });

        expect([...points.values()].map(p => p.payload.sectionSlug)).toEqual(["1-tableaux"]);
        expect(report.pointsDeleted).toBe(1);
    });

    test("indexe un contenu absent de l'index même s'il n'a pas été modifié (section renommée)", async () => {
        const {store, points} = memoryStore();

        const report = await syncContents({
            contents: [content("3-renommee", [section("a", "A", "texte a")], hier)],
            since: derniereSynchro, store, embed,
        });

        expect(points.size).toBe(1);
        expect(report.contentsChecked).toBe(1);
    });

    test("un contenu vide n'est pas compté comme relu à chaque synchro", async () => {
        const {store} = memoryStore();
        const contents = [content("4-vide", [], hier)];
        await syncContents({contents, since: null, store, embed});

        const report = await syncContents({contents, since: derniereSynchro, store, embed});

        expect(report.contentsChecked).toBe(0);
    });

    test("un changement de visibilité du module met à jour le point", async () => {
        const {store, points} = memoryStore();
        await syncContents({contents: [content("1-tableaux", [section("a", "A", "texte a")], hier, false)], since: null, store, embed});

        await syncContents({contents: [content("1-tableaux", [section("a", "A", "texte a")], ensuite, true)], since: derniereSynchro, store, embed});

        expect([...points.values()][0].payload.moduleVisible).toBe(true);
    });
});
