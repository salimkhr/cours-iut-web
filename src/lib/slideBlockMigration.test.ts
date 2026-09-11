import { describe, expect, test } from "bun:test";
import { toSlideBlocks, countConvertible, findUnrenderableTypes } from "./slideBlockMigration";
import type { Block } from "@/types/CourseContent";

describe("slideBlockMigration", () => {
    test("converts a legacy slide-screen root and its cours-typed children", () => {
        const before: Block[] = [{
            id: "1", type: "slide-screen", props: { title: "Titre" }, children: [
                { id: "2", type: "text", props: { content: "Bonjour" } },
            ],
        }];

        const after = toSlideBlocks(before);

        expect(after[0].type).toBe("slide");
        expect(after[0].children?.[0].type).toBe("slide-text");
        expect(findUnrenderableTypes(after)).toEqual([]);
    });

    test("converts a `section`-rooted document (cours block model saved under contentType slide)", () => {
        const before: Block[] = [{
            id: "1", type: "section", props: { title: "Structurer son code" }, children: [
                { id: "2", type: "text", props: { content: "Intro" } },
                {
                    id: "3", type: "list", props: { ordered: false }, children: [
                        { id: "4", type: "list-item", props: { text: "Un point" } },
                    ],
                },
            ],
        }];

        expect(countConvertible(before)).toBe(4); // section + text + list + list-item

        const after = toSlideBlocks(before);

        expect(after[0].type).toBe("slide");
        expect(after[0].props).toEqual({ title: "Structurer son code" });
        expect(after[0].children?.[0].type).toBe("slide-text");
        expect(after[0].children?.[1].type).toBe("slide-list");
        expect(after[0].children?.[1].children?.[0].type).toBe("slide-list-item");
        expect(findUnrenderableTypes(after)).toEqual([]);
    });

    test("is idempotent: an already-converted tree comes out unchanged", () => {
        const alreadySlide: Block[] = [{
            id: "1", type: "slide", props: { title: "OK" }, children: [
                { id: "2", type: "slide-text", props: { content: "Déjà bon" } },
            ],
        }];

        expect(countConvertible(alreadySlide)).toBe(0);
        expect(toSlideBlocks(alreadySlide)).toEqual(alreadySlide);
    });

    test("leaves unrenderable types visible after conversion when no mapping exists", () => {
        const before: Block[] = [{
            id: "1", type: "section", props: { title: "T" }, children: [
                { id: "2", type: "callout", props: { variant: "info" } },
            ],
        }];

        const after = toSlideBlocks(before);
        expect(findUnrenderableTypes(after)).toEqual(["callout"]);
    });
});
