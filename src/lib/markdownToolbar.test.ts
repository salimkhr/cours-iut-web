/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { applyInlineMarker } from "@/lib/markdownToolbar";

test("entoure la sélection de **", () => {
    const r = applyInlineMarker("abc", 1, 2, "bold");
    expect(r.text).toBe("a**b**c");
    expect(r.selStart).toBe(3);
    expect(r.selEnd).toBe(4);
});

test("italique avec _", () => {
    expect(applyInlineMarker("xy", 0, 2, "italic").text).toBe("_xy_");
});

test("code inline avec backticks", () => {
    expect(applyInlineMarker("x", 0, 1, "code").text).toBe("`x`");
});

test("lien : la sélection devient le label, url placeholder", () => {
    const r = applyInlineMarker("site", 0, 4, "link");
    expect(r.text).toBe("[site](url)");
});

test("sélection vide : insère les marqueurs et place le curseur entre", () => {
    const r = applyInlineMarker("ab", 1, 1, "bold");
    expect(r.text).toBe("a****b");
    expect(r.selStart).toBe(3);
    expect(r.selEnd).toBe(3);
});
