import {test, expect, describe} from "bun:test";
import {chunkContent, type ChunkSource} from "@/lib/rag/chunk";
import type {Block} from "@/types/CourseContent";

const source: ChunkSource = {
    moduleSlug: "php",
    moduleTitle: "PHP",
    sectionSlug: "3-tableaux",
    sectionTitle: "Tableaux",
    contentType: "cours",
};

const text = (id: string, content: string): Block => ({id, type: "text", props: {content}}) as Block;
const section = (id: string, title: string, children: Block[]): Block =>
    ({id, type: "section", props: {title}, children}) as Block;
const mots = (n: number) => Array.from({length: n}, (_, i) => `mot${i}`).join(" ");

describe("chunkContent", () => {
    test("une section de premier niveau donne un morceau", () => {
        const chunks = chunkContent(source, [
            section("s1", "Les tableaux associatifs", [text("t1", "Une clé, une valeur.")]),
            section("s2", "Parcourir un tableau", [text("t2", "foreach parcourt les clés.")]),
        ]);

        expect(chunks.map(c => c.title)).toEqual(["Les tableaux associatifs", "Parcourir un tableau"]);
        expect(chunks[0].blockIds).toEqual(["s1", "t1"]);
    });

    test("le texte commence par son contexte et ne garde pas les marqueurs d'id", () => {
        const [chunk] = chunkContent(source, [section("s1", "Les tableaux associatifs", [text("t1", "Une clé, une valeur.")])]);

        expect(chunk.text.startsWith("PHP › Tableaux › Cours › Les tableaux associatifs\n\n")).toBe(true);
        expect(chunk.text).toContain("Une clé, une valeur.");
        expect(chunk.text).not.toContain("<!--");
    });

    test("un bloc isolé est rattaché à la section qui le suit", () => {
        const chunks = chunkContent(source, [
            text("intro", "Dans ce cours, on range des données."),
            section("s1", "Les tableaux associatifs", [text("t1", "Une clé, une valeur.")]),
        ]);

        expect(chunks).toHaveLength(1);
        expect(chunks[0].blockIds).toEqual(["intro", "s1", "t1"]);
    });

    test("un bloc isolé en fin de contenu rejoint le dernier morceau", () => {
        const chunks = chunkContent(source, [
            section("s1", "Les tableaux associatifs", [text("t1", "Une clé, une valeur.")]),
            text("fin", "À retenir : une clé est unique."),
        ]);

        expect(chunks).toHaveLength(1);
        expect(chunks[0].text).toContain("À retenir");
    });

    test("une section trop longue est recoupée à ses sous-sections", () => {
        const chunks = chunkContent(source, [
            section("s1", "Tableaux", [
                text("intro", "Deux sortes de tableaux."),
                section("a", "Indexés", [text("ta", mots(400))]),
                section("b", "Associatifs", [text("tb", mots(400))]),
            ]),
        ], 600);

        expect(chunks.map(c => c.title)).toEqual(["Tableaux › Indexés", "Tableaux › Associatifs"]);
        expect(chunks[0].blockIds).toEqual(["s1", "intro", "a", "ta"]);
        expect(chunks.every(c => c.words <= 600)).toBe(true);
    });

    test("sans sous-section, une section trop longue est recoupée entre deux blocs", () => {
        const chunks = chunkContent(source, [
            section("s1", "Tableaux", [text("t1", mots(300)), text("t2", mots(300)), text("t3", mots(300))]),
        ], 600);

        expect(chunks).toHaveLength(2);
        expect(chunks[0].blockIds).toEqual(["s1", "t1", "t2"]);
        expect(chunks[1].blockIds).toEqual(["t3"]);
        expect(chunks[1].title).toBe("Tableaux (suite)");
    });

    test("un bloc plus long que la limite reste entier", () => {
        const chunks = chunkContent(source, [section("s1", "Tableaux", [text("t1", mots(900))])], 600);

        expect(chunks).toHaveLength(1);
        expect(chunks[0].words).toBeGreaterThan(600);
    });

    test("une section sans titre devient « Introduction »", () => {
        const [chunk] = chunkContent(source, [section("s1", "", [text("t1", "Ce cours présente les tableaux.")])]);

        expect(chunk.title).toBe("Introduction");
        expect(chunk.text).not.toContain("(vide)");
    });

    test("les morceaux sont numérotés dans l'ordre du contenu", () => {
        const chunks = chunkContent(source, [
            section("s1", "A", [text("t1", "a")]),
            section("s2", "B", [text("t2", "b")]),
        ]);

        expect(chunks.map(c => c.index)).toEqual([0, 1]);
    });
});
