/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { isSlideContainerBlock } from "@/components/Slides/SlideBlocksRenderer";
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
