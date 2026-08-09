import {test, expect} from "bun:test";
import {isRunnable} from "@/lib/previewDocument";

test("reconnaît les langages exécutables par le navigateur", () => {
    expect(isRunnable("html")).toBe(true);
    expect(isRunnable("css")).toBe(true);
    expect(isRunnable("javascript")).toBe(true);
});

test("accepte les alias de langage", () => {
    expect(isRunnable("js")).toBe(true);
    expect(isRunnable("HTML")).toBe(true);
    expect(isRunnable("xml")).toBe(true);
});

test("rejette les langages sans interpréteur navigateur", () => {
    for (const lang of ["php", "rust", "sql", "bash", "json"]) {
        expect(isRunnable(lang)).toBe(false);
    }
});

test("rejette les langages qui exigeraient une transpilation", () => {
    for (const lang of ["typescript", "jsx", "tsx"]) {
        expect(isRunnable(lang)).toBe(false);
    }
});

test("tolère l'absence de langage", () => {
    expect(isRunnable(null)).toBe(false);
    expect(isRunnable(undefined)).toBe(false);
    expect(isRunnable("")).toBe(false);
});
