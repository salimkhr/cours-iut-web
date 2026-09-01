/// <reference types="bun-types" />
import {expect, test} from "bun:test";
import {computeSlideStepCounts} from "@/components/Slides/utils/slideSteps";
import type {Block} from "@/types/CourseContent";

function slide(id: string, children: Block[]): Block {
    return {id, type: "slide", props: {}, children};
}

function slideCode(highlight?: string): Block {
    return {id: "c", type: "slide-code", props: highlight !== undefined ? {highlight} : {}};
}

function slideCodeWithPreview(highlight?: string, secondaryHighlight?: string): Block {
    return {
        id: "p",
        type: "slide-code-with-preview",
        props: {
            ...(highlight !== undefined ? {highlight} : {}),
            ...(secondaryHighlight !== undefined ? {secondaryHighlight} : {}),
        },
    };
}

test("une slide sans bloc code n'a aucune etape", () => {
    expect(computeSlideStepCounts([slide("s1", [{id: "t", type: "slide-text", props: {}}])]))
        .toEqual([0]);
});

test("le nombre d'etapes suit le nombre de groupes separes par |", () => {
    // "1 | 2-4 | 6" fait trois groupes, donc deux etapes en plus de la premiere.
    expect(computeSlideStepCounts([slide("s1", [slideCode("1 | 2-4 | 6")])]))
        .toEqual([2]);
});

test("un seul groupe ne compte pour aucune etape supplementaire", () => {
    expect(computeSlideStepCounts([slide("s1", [slideCode("1-3")])]))
        .toEqual([0]);
});

test("code-with-preview prend le panneau qui declare le plus de groupes", () => {
    expect(computeSlideStepCounts([slide("s1", [slideCodeWithPreview("1 | 2", "1 | 2 | 3")])]))
        .toEqual([2]);
});

test("cherche a l'interieur d'une colonne", () => {
    const columns: Block = {
        id: "cols",
        type: "columns",
        props: {},
        children: [{id: "col", type: "column", props: {span: 6}, children: [slideCode("1 | 2 | 3")]}],
    };
    expect(computeSlideStepCounts([slide("s1", [columns])])).toEqual([2]);
});

test("prend le maximum quand plusieurs blocs code cohabitent sur la meme slide", () => {
    expect(computeSlideStepCounts([slide("s1", [slideCode("1 | 2"), slideCode("1 | 2 | 3 | 4")])]))
        .toEqual([3]);
});

test("traite chaque slide independamment", () => {
    expect(computeSlideStepCounts([
        slide("s1", [slideCode("1 | 2")]),
        slide("s2", [{id: "t", type: "slide-text", props: {}}]),
        slide("s3", [slideCode("1 | 2 | 3")]),
    ])).toEqual([1, 0, 2]);
});

test("renvoie une liste vide pour un deck vide", () => {
    expect(computeSlideStepCounts([])).toEqual([]);
});
