import {test, expect, describe} from "bun:test";
import {embedTexts, batchTexts, type EmbeddingsClient} from "@/lib/rag/embed";

type Request = { model: string; inputs: string[] };

function fakeClient(requests: Request[], failWith?: { statusCode: number; body: string }): EmbeddingsClient {
    return {
        embeddings: {
            async create(request) {
                requests.push(request);
                if (failWith) throw Object.assign(new Error("API error"), failWith);
                // Renvoyés dans le désordre : l'ordre doit venir du champ index.
                const data = request.inputs.map((text, index) => ({index, embedding: [text.length, index]})).reverse();
                return {data, usage: {totalTokens: 10}};
            },
        },
    };
}

describe("batchTexts", () => {
    test("regroupe les textes sans dépasser le budget de tokens estimé", () => {
        const texts = ["a".repeat(300), "b".repeat(300), "c".repeat(300)];

        expect(batchTexts(texts, 200)).toEqual([[0, 1], [2]]);
    });

    test("un texte plus gros que le budget part seul", () => {
        expect(batchTexts(["a".repeat(3000), "b"], 200)).toEqual([[0], [1]]);
    });
});

describe("embedTexts", () => {
    test("demande le modèle mistral-embed", async () => {
        const requests: Request[] = [];
        await embedTexts(["bonjour"], {client: fakeClient(requests)});

        expect(requests).toEqual([{model: "mistral-embed", inputs: ["bonjour"]}]);
    });

    test("renvoie un vecteur par texte, dans l'ordre des textes", async () => {
        const {vectors} = await embedTexts(["a", "bb", "ccc"], {client: fakeClient([])});

        expect(vectors).toEqual([[1, 0], [2, 1], [3, 2]]);
    });

    test("additionne les tokens facturés de chaque lot", async () => {
        const texts = ["a".repeat(300), "b".repeat(300), "c".repeat(300)];
        const requests: Request[] = [];
        const {tokens} = await embedTexts(texts, {client: fakeClient(requests), maxTokensPerBatch: 200});

        expect(requests).toHaveLength(2);
        expect(tokens).toBe(20);
    });

    test("une erreur de l'API remonte avec son statut et son message", async () => {
        const client = fakeClient([], {statusCode: 401, body: "clé invalide"});

        expect(embedTexts(["a"], {client})).rejects.toThrow("Mistral embeddings 401 : clé invalide");
    });
});
