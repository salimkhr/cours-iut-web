/// <reference types="bun-types" />
import { expect, test, beforeEach } from "bun:test";
import { useBuilderStore } from "@/lib/store/builderStore";
import type { Block } from "@/types/CourseContent";

function b(id: string): Block {
    return { id, type: "text", props: { content: id }, children: [] };
}

beforeEach(() => {
    useBuilderStore.setState({
        blocks: [],
        activeSlideId: null,
        editingBlockId: null,
        selectedId: null,
        _history: [],
        _future: [],
        isDirty: false,
    });
});

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

test("moveBlockToIndex est un no-op si la position ne change pas (pas de pollution undo)", () => {
    useBuilderStore.getState().setBlocks([b("a"), b("b"), b("c")], "mod", "cours");
    const histLen = useBuilderStore.getState()._history.length;
    useBuilderStore.getState().moveBlockToIndex("b", null, 1);
    const after = useBuilderStore.getState();
    expect(after.blocks.map((x) => x.id)).toEqual(["a", "b", "c"]);
    expect(after._history.length).toBe(histLen);
});
