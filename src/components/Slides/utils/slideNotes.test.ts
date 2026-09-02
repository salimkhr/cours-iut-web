/// <reference types="bun-types" />
import {expect, test} from "bun:test";
import {computeSlideNotes} from "@/components/Slides/utils/slideNotes";
import type {Block} from "@/types/CourseContent";

function slide(id: string, children: Block[]): Block {
    return {id, type: "slide", props: {}, children};
}

function note(content: string): Block {
    return {id: "n", type: "slide-note", props: {content}};
}

test("une slide sans note renvoie null", () => {
    expect(computeSlideNotes([slide("s1", [{id: "t", type: "slide-text", props: {}}])]))
        .toEqual([null]);
});

test("lit le contenu de la note, sans passer par le rendu React", () => {
    expect(computeSlideNotes([slide("s1", [note("À dire : ceci et cela.")])]))
        .toEqual(["À dire : ceci et cela."]);
});

test("une note vide ou faite d'espaces compte comme absente", () => {
    expect(computeSlideNotes([slide("s1", [note("   ")])])).toEqual([null]);
    expect(computeSlideNotes([slide("s1", [note("")])])).toEqual([null]);
});

test("recadre les espaces de bord", () => {
    expect(computeSlideNotes([slide("s1", [note("  Bonjour  ")])])).toEqual(["Bonjour"]);
});

test("traite chaque slide independamment", () => {
    expect(computeSlideNotes([
        slide("s1", [note("Note 1")]),
        slide("s2", [{id: "t", type: "slide-text", props: {}}]),
        slide("s3", [note("Note 3")]),
    ])).toEqual(["Note 1", null, "Note 3"]);
});
