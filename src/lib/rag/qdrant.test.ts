import {test, expect, describe} from "bun:test";
import {pointId, recreateCollection, upsertPoints, searchPoints, ensureCollection, scrollPoints, deletePoints} from "@/lib/rag/qdrant";

type Call = { url: string; method: string; body: unknown };

function fakeFetch(calls: Call[], result: unknown = true): typeof fetch {
    return (async (url: string, init: RequestInit) => {
        calls.push({url, method: String(init.method), body: init.body ? JSON.parse(String(init.body)) : undefined});
        return Response.json({status: "ok", result});
    }) as unknown as typeof fetch;
}

const qdrant = (calls: Call[], result?: unknown) => ({url: "http://qdrant:6333", fetchImpl: fakeFetch(calls, result)});

describe("pointId", () => {
    test("donne toujours le même UUID pour la même clé", () => {
        expect(pointId("php/3-tableaux/cours/0")).toBe(pointId("php/3-tableaux/cours/0"));
        expect(pointId("php/3-tableaux/cours/0")).not.toBe(pointId("php/3-tableaux/cours/1"));
        expect(pointId("x")).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
});

describe("client Qdrant", () => {
    test("recrée la collection avec la taille des vecteurs et la distance cosinus", async () => {
        const calls: Call[] = [];
        await recreateCollection(qdrant(calls), "cours", 1024);

        expect(calls.map(c => `${c.method} ${c.url}`)).toEqual([
            "DELETE http://qdrant:6333/collections/cours",
            "PUT http://qdrant:6333/collections/cours",
        ]);
        expect(calls[1].body).toEqual({vectors: {size: 1024, distance: "Cosine"}});
    });

    test("ajoute les points et attend qu'ils soient indexés", async () => {
        const calls: Call[] = [];
        await upsertPoints(qdrant(calls), "cours", [{id: "a", vector: [1, 0], payload: {titre: "A"}}]);

        expect(calls[0].url).toBe("http://qdrant:6333/collections/cours/points?wait=true");
        expect(calls[0].body).toEqual({points: [{id: "a", vector: [1, 0], payload: {titre: "A"}}]});
    });

    test("cherche les points les plus proches avec leur payload", async () => {
        const calls: Call[] = [];
        const found = [{id: "a", score: 0.9, payload: {titre: "A"}}];
        const hits = await searchPoints(qdrant(calls, {points: found}), "cours", [1, 0], 5);

        expect(calls[0].body).toEqual({query: [1, 0], limit: 5, with_payload: true});
        expect(hits).toEqual(found);
    });

    test("crée la collection seulement si elle n'existe pas", async () => {
        const absent: Call[] = [];
        await ensureCollection(qdrant(absent, {exists: false}), "cours", 1024);
        const present: Call[] = [];
        await ensureCollection(qdrant(present, {exists: true}), "cours", 1024);

        expect(absent.map(c => `${c.method} ${c.url}`)).toEqual([
            "GET http://qdrant:6333/collections/cours/exists",
            "PUT http://qdrant:6333/collections/cours",
        ]);
        expect(present).toHaveLength(1);
    });

    test("parcourt tous les points, page après page", async () => {
        const calls: Call[] = [];
        const pages = [
            {points: [{id: "a", payload: {hash: "1"}}], next_page_offset: "a"},
            {points: [{id: "b", payload: {hash: "2"}}], next_page_offset: null},
        ];
        const fetchImpl = (async (url: string, init: RequestInit) => {
            calls.push({url, method: String(init.method), body: JSON.parse(String(init.body))});
            return Response.json({result: pages[calls.length - 1]});
        }) as unknown as typeof fetch;

        const points = await scrollPoints({url: "http://q", fetchImpl}, "cours", ["hash"]);

        expect(points.map(p => p.id)).toEqual(["a", "b"]);
        expect(calls[1].body).toEqual({limit: 256, with_payload: ["hash"], with_vector: false, offset: "a"});
    });

    test("supprime des points par id", async () => {
        const calls: Call[] = [];
        await deletePoints(qdrant(calls), "cours", ["a", "b"]);

        expect(calls[0].url).toBe("http://qdrant:6333/collections/cours/points/delete?wait=true");
        expect(calls[0].body).toEqual({points: ["a", "b"]});
    });

    test("ne fait aucun appel pour une suppression vide", async () => {
        const calls: Call[] = [];
        await deletePoints(qdrant(calls), "cours", []);

        expect(calls).toHaveLength(0);
    });

    test("une erreur de Qdrant remonte avec son statut", async () => {
        const fetchImpl = (async () => new Response("collection absente", {status: 404})) as unknown as typeof fetch;

        expect(searchPoints({url: "http://q", fetchImpl}, "x", [1], 1)).rejects.toThrow("Qdrant 404 : collection absente");
    });
});
