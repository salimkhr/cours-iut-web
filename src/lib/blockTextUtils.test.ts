import {test, expect} from "bun:test";
import {blocksToMarkdown, extractTextFields} from "@/lib/blockTextUtils";
import type {Block} from "@/types/CourseContent";

const bloc = {
    id: "b1",
    type: "code-with-preview",
    props: {
        language: "css",
        code: ".a { color: red }",
        secondaryLanguage: "html",
        secondaryCode: "<p>Bonjour</p>",
    },
} as unknown as Block;

test("la copie Markdown inclut le second panneau de code", () => {
    const texte = blocksToMarkdown([bloc]);

    expect(texte).toContain(".a { color: red }");
    expect(texte).toContain("<p>Bonjour</p>");
});

test("la recherche indexe le second panneau de code", () => {
    expect(extractTextFields(bloc)).toContain("<p>Bonjour</p>");
});
