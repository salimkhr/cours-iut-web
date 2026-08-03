/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { isSlideContainerBlock } from "@/components/Slides/SlideBlocksRenderer";
import { validateBlockTree } from "@/lib/validateBlockTree";
import type { Block } from "@/types/CourseContent";

function blockOfType(type: string): Block {
    return {
        id: type,
        type,
        props: {},
    };
}

test("accepte les conteneurs de slide actuels et migrés", () => {
    expect(isSlideContainerBlock(blockOfType("slide"))).toBe(true);
    expect(isSlideContainerBlock(blockOfType("slide-screen"))).toBe(true);
    expect(isSlideContainerBlock(blockOfType("slide-text"))).toBe(false);
});

test("accepte un diagramme Mermaid dans une slide Mongo", () => {
    const blocks: Block[] = [
        {
            id: "slide-diagram",
            type: "slide",
            props: {title: "Diagramme Mermaid"},
            children: [
                {
                    id: "diagram",
                    type: "diagram",
                    props: {
                        header: "Flux",
                        chart: "flowchart LR\n    A[Slide titre] --> B[Contenu]",
                    },
                },
            ],
        },
    ];

    expect(validateBlockTree(blocks)).toEqual({
        valid: true,
        errors: [],
    });
});
