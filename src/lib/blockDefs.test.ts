import {test, expect} from "bun:test";
import {blockDefs} from "@/lib/blockDefs";

test("configure les champs code longs sur 15 lignes dans le builder", () => {
    for (const type of ["code", "code-with-preview", "download-file", "slide-code"]) {
        const def = blockDefs.find((blockDef) => blockDef.type === type);
        const codeField = def?.fields.find((field) => field.key === "code");

        expect(codeField?.rows).toBe(15);
    }
});

test("le bloc code-with-preview propose les mêmes langages que le bloc code", () => {
    const codeDef = blockDefs.find((def) => def.type === "code");
    const previewDef = blockDefs.find((def) => def.type === "code-with-preview");

    const codeLangs = codeDef?.fields.find((f) => f.key === "language")?.options;
    const previewLangs = previewDef?.fields.find((f) => f.key === "language")?.options;

    expect(previewLangs).toEqual(codeLangs);
});

test("le second panneau de code est configuré comme le premier", () => {
    const def = blockDefs.find((blockDef) => blockDef.type === "code-with-preview");
    const secondary = def?.fields.find((field) => field.key === "secondaryCode");

    expect(secondary?.rows).toBe(15);
    expect(def?.fields.find((f) => f.key === "secondaryLanguage")?.type).toBe("select");
});

test("la description du bloc documente les marqueurs pour le MCP", () => {
    const def = blockDefs.find((blockDef) => blockDef.type === "code-with-preview");

    expect(def?.description).toContain("@edit:");
});
