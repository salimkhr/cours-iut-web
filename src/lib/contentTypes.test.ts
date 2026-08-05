import { describe, expect, test } from "bun:test";
import { CONTENT_ORDER, normalizeContentKey } from "@/lib/contentTypes";

describe("normalizeContentKey", () => {
    test("laisse passer les types canoniques", () => {
        for (const key of CONTENT_ORDER) {
            expect(normalizeContentKey(key)).toBe(key);
        }
    });

    test("ramène les variantes de casse sur la forme canonique", () => {
        expect(normalizeContentKey("tp")).toBe("TP");
        expect(normalizeContentKey("Tp")).toBe("TP");
        expect(normalizeContentKey("COURS")).toBe("cours");
        expect(normalizeContentKey("Slide")).toBe("slide");
    });

    test("ignore les espaces autour du segment", () => {
        expect(normalizeContentKey("  TP  ")).toBe("TP");
    });

    test("refuse un type inconnu", () => {
        expect(normalizeContentKey("nimportequoi")).toBeNull();
        expect(normalizeContentKey("")).toBeNull();
        expect(normalizeContentKey("tps")).toBeNull();
    });
});
