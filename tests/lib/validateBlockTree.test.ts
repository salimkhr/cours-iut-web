// tests/lib/validateBlockTree.test.ts
import { describe, it, expect } from "bun:test";
import { validateBlockTree } from "@/lib/validateBlockTree";

describe("validateBlockTree", () => {
    it("accepte un arbre valide", () => {
        const result = validateBlockTree([
            { id: "a", type: "heading", props: { level: 2, text: "Titre" } },
            {
                id: "b", type: "columns", props: {}, children: [
                    { id: "c", type: "column", props: { span: 8 }, children: [
                        { id: "d", type: "text", props: { content: "gauche" } },
                    ] },
                    { id: "e", type: "column", props: { span: 4 }, children: [] },
                ],
            },
            {
                id: "f", type: "list", props: { ordered: true }, children: [
                    { id: "g", type: "list-item", props: { text: "étape" }, children: [
                        { id: "h", type: "code", props: { language: "js", code: "x" } },
                    ] },
                ],
            },
        ]);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
    });

    it("refuse une entrée qui n'est pas un tableau", () => {
        expect(validateBlockTree("nope").valid).toBe(false);
        expect(validateBlockTree(null).valid).toBe(false);
    });

    it("refuse un bloc sans id / type / props", () => {
        const result = validateBlockTree([{ type: "text", props: {} }]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].path).toBe("blocks[0]");
    });

    it("refuse un type inconnu", () => {
        const result = validateBlockTree([{ id: "a", type: "wat", props: {} }]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain("inconnu");
    });

    it("refuse des props invalides avec le chemin du bloc", () => {
        const result = validateBlockTree([
            { id: "a", type: "heading", props: { level: 7, text: "x" } },
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].path).toBe("blocks[0]");
    });

    it("refuse des ids dupliqués", () => {
        const result = validateBlockTree([
            { id: "a", type: "text", props: { content: "" } },
            { id: "a", type: "text", props: { content: "" } },
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain("dupliqué");
    });

    it("refuse des children sur une feuille", () => {
        const result = validateBlockTree([
            { id: "a", type: "text", props: { content: "" }, children: [
                { id: "b", type: "text", props: { content: "" } },
            ] },
        ]);
        expect(result.valid).toBe(false);
    });

    it("refuse columns hors racine", () => {
        const result = validateBlockTree([
            { id: "a", type: "callout", props: { variant: "info" }, children: [
                { id: "b", type: "columns", props: {}, children: [
                    { id: "c", type: "column", props: { span: 6 }, children: [] },
                    { id: "d", type: "column", props: { span: 6 }, children: [] },
                ] },
            ] },
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].path).toBe("blocks[0].children[0]");
    });

    it("refuse un enfant non autorisé (text direct dans list)", () => {
        const result = validateBlockTree([
            { id: "a", type: "list", props: { ordered: false }, children: [
                { id: "b", type: "text", props: { content: "x" } },
            ] },
        ]);
        expect(result.valid).toBe(false);
    });

    it("refuse columns avec somme des spans ≠ 12 ou moins de 2 colonnes", () => {
        const bad = validateBlockTree([
            { id: "a", type: "columns", props: {}, children: [
                { id: "b", type: "column", props: { span: 6 }, children: [] },
                { id: "c", type: "column", props: { span: 4 }, children: [] },
            ] },
        ]);
        expect(bad.valid).toBe(false);

        const single = validateBlockTree([
            { id: "a", type: "columns", props: {}, children: [
                { id: "b", type: "column", props: { span: 12 }, children: [] },
            ] },
        ]);
        expect(single.valid).toBe(false);
    });

    it("refuse au-delà de la profondeur max", () => {
        let tree: Record<string, unknown> = { id: "leaf", type: "list-item", props: { text: "x" }, children: [] };
        for (let i = 0; i < 9; i++) {
            tree = { id: `l${i}`, type: "list", props: { ordered: false }, children: [
                { id: `i${i}`, type: "list-item", props: { text: "" }, children: [tree] },
            ] };
        }
        expect(validateBlockTree([tree]).valid).toBe(false);
    });
});
