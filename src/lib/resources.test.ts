import {describe, expect, it} from "bun:test";
import type {Collection, Document} from "mongodb";
import {addResource} from "./resources";

/** Collection factice : enregistre les documents insérés et retrouve par URL. */
function fakeCollection() {
    const docs: (Document & {_id: {toString(): string}})[] = [];
    let nextId = 1;
    const collection = {
        async findOne(filter: {url: string}) {
            return docs.find((d) => d.url === filter.url) ?? null;
        },
        async insertOne(doc: Document) {
            const id = `id-${nextId++}`;
            const _id = {toString: () => id};
            docs.push({...doc, _id});
            return {insertedId: _id};
        },
    };
    return {collection: collection as unknown as Collection<Document>, docs};
}

const valid = {
    title: "An Alien Mind",
    url: "https://openai.com/fr-FR/index/an-alien-mind/",
    description: "Un texte sur l'évolution des modèles d'IA.",
    kind: "article",
};

describe("addResource", () => {
    it("crée une ressource visible, datée, sans champ facultatif à null", async () => {
        const {collection, docs} = fakeCollection();
        const now = new Date("2026-10-14T10:00:00Z");

        const result = await addResource(collection, valid, now);

        expect(result).toEqual({status: "created", id: "id-1", title: "An Alien Mind"});
        expect(docs).toHaveLength(1);
        expect(docs[0]).toMatchObject({...valid, isVisible: true, createdAt: now});
        expect("durationMin" in docs[0]).toBe(false);
        expect("note" in docs[0]).toBe(false);
    });

    it("enregistre la durée et le mot du prof quand ils sont fournis", async () => {
        const {collection, docs} = fakeCollection();

        await addResource(collection, {...valid, durationMin: 43, note: "À lire en premier."});

        expect(docs[0]).toMatchObject({durationMin: 43, note: "À lire en premier."});
    });

    it("n'ajoute pas deux fois la même URL", async () => {
        const {collection, docs} = fakeCollection();

        const first = await addResource(collection, valid);
        const second = await addResource(collection, {...valid, title: "Autre titre"});

        expect(first.status).toBe("created");
        expect(second).toEqual({status: "duplicate", id: "id-1", title: "An Alien Mind"});
        expect(docs).toHaveLength(1);
    });

    it("refuse une URL non http(s) et ne l'écrit pas", async () => {
        const {collection, docs} = fakeCollection();

        await expect(addResource(collection, {...valid, url: "javascript:alert(1)"})).rejects.toThrow("Ressource invalide");
        expect(docs).toHaveLength(0);
    });

    it("refuse un type inconnu, une description vide et une durée négative", async () => {
        const {collection, docs} = fakeCollection();

        await expect(addResource(collection, {...valid, kind: "podcast"})).rejects.toThrow();
        await expect(addResource(collection, {...valid, description: "  "})).rejects.toThrow();
        await expect(addResource(collection, {...valid, durationMin: -3})).rejects.toThrow();
        expect(docs).toHaveLength(0);
    });
});
