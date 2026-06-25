/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { useBuilderStore } from "@/lib/store/builderStore";
import type { Block } from "@/types/CourseContent";

function b(id: string): Block {
    return { id, type: "text", props: { content: id }, children: [] };
}

test("moveBlockToIndex réordonne au niveau racine", () => {
    const store = useBuilderStore.getState();
    store.setBlocks([b("a"), b("b"), b("c")], "mod", "cours");
    useBuilderStore.getState().moveBlockToIndex("c", null, 0);
    const ids = useBuilderStore.getState().blocks.map((x) => x.id);
    expect(ids).toEqual(["c", "a", "b"]);
});

test("setActiveSlide et setEditingBlock mettent à jour l'état", () => {
    useBuilderStore.getState().setActiveSlide("s1");
    useBuilderStore.getState().setEditingBlock("e1");
    expect(useBuilderStore.getState().activeSlideId).toBe("s1");
    expect(useBuilderStore.getState().editingBlockId).toBe("e1");
});
