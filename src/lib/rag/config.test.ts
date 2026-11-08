import {afterEach, describe, expect, test} from "bun:test";
import {qdrantFromEnv, ragCollection} from "@/lib/rag/config";

const saved = {...process.env};
afterEach(() => {
    for (const key of ["QDRANT_URL", "QDRANT_API_KEY", "RAG_COLLECTION"]) {
        if (saved[key] === undefined) delete process.env[key];
        else process.env[key] = saved[key];
    }
});

describe("configuration du RAG", () => {
    test("sans variable, vise le Qdrant local et la collection par défaut", () => {
        delete process.env.QDRANT_URL;
        delete process.env.QDRANT_API_KEY;
        delete process.env.RAG_COLLECTION;

        expect(qdrantFromEnv()).toEqual({url: "http://localhost:6333", apiKey: undefined});
        expect(ragCollection()).toBe("cours_mistral");
    });

    test("lit l'adresse, la clé et la collection de l'environnement", () => {
        process.env.QDRANT_URL = "http://qdrant:6333";
        process.env.QDRANT_API_KEY = "cle";
        process.env.RAG_COLLECTION = "cours_staging";

        expect(qdrantFromEnv()).toEqual({url: "http://qdrant:6333", apiKey: "cle"});
        expect(ragCollection()).toBe("cours_staging");
    });
});
