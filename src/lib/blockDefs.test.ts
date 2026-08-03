import {test, expect} from "bun:test";
import {blockDefs} from "@/lib/blockDefs";

test("configure les champs code longs sur 15 lignes dans le builder", () => {
    for (const type of ["code", "code-with-preview", "download-file", "slide-code"]) {
        const def = blockDefs.find((blockDef) => blockDef.type === type);
        const codeField = def?.fields.find((field) => field.key === "code");

        expect(codeField?.rows).toBe(15);
    }
});
