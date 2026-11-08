import {afterAll, beforeAll, describe, expect, test} from "bun:test";
import type {Db} from "mongodb";
import {startMemoryDb} from "../helpers/db";
import {costUsd, listUsage, logUsage, summarizeUsage} from "@/lib/rag/usage";

let db: Db;
let stop: () => Promise<void>;

beforeAll(async () => {
    ({db, stop} = await startMemoryDb());
});
afterAll(async () => stop());

describe("journal d'usage du RAG", () => {
    test("le coût suit le prix de mistral-embed (0,10 $ le million de tokens)", () => {
        expect(costUsd(1_000_000)).toBeCloseTo(0.1);
        expect(costUsd(313_134)).toBeCloseTo(0.0313, 4);
    });

    test("enregistre un appel avec sa date et son coût", async () => {
        await logUsage(db, {step: "index", model: "mistral-embed", inputs: 482, tokens: 313_134, durationMs: 29_000, collection: "cours_mistral"});

        const [entry] = await listUsage(db);
        expect(entry.step).toBe("index");
        expect(entry.costUsd).toBeCloseTo(0.0313, 4);
        expect(entry.createdAt).toBeInstanceOf(Date);
    });

    test("liste les appels du plus récent au plus ancien", async () => {
        await logUsage(db, {step: "search", model: "mistral-embed", inputs: 1, tokens: 12, durationMs: 300, collection: "cours_mistral", query: "injections SQL"});

        const entries = await listUsage(db);
        expect(entries.map(e => e.step)).toEqual(["search", "index"]);
        expect(entries[0].query).toBe("injections SQL");
    });

    test("totalise les appels, les tokens et le coût par étape", async () => {
        const summary = summarizeUsage(await listUsage(db));

        expect(summary.index).toEqual({calls: 1, tokens: 313_134, costUsd: costUsd(313_134)});
        expect(summary.search).toEqual({calls: 1, tokens: 12, costUsd: costUsd(12)});
    });
});
