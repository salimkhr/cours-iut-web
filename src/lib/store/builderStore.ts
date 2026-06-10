import { create } from "zustand";
import type { Block } from "@/types/CourseContent";

interface BuilderStore {
    blocks: Block[];
    selectedId: string | null;
    isDirty: boolean;
    setBlocks: (blocks: Block[]) => void;
    selectBlock: (id: string | null) => void;
    updateBlock: (id: string, props: Record<string, unknown>, colSpan?: "full" | "half") => void;
    insertBlock: (block: Block, position?: number) => void;
    deleteBlock: (id: string) => void;
    moveBlock: (id: string, direction: "up" | "down") => void;
    reorderBlocks: (orderedIds: string[]) => void;
    markSaved: () => void;
}

export const useBuilderStore = create<BuilderStore>()((set) => ({
    blocks: [],
    selectedId: null,
    isDirty: false,

    setBlocks: (blocks) => set({ blocks, isDirty: false }),

    selectBlock: (id) => set({ selectedId: id }),

    updateBlock: (id, props, colSpan) =>
        set((state) => ({
            blocks: state.blocks.map((b) =>
                b.id === id
                    ? { ...b, props, ...(colSpan !== undefined ? { colSpan } : {}) }
                    : b
            ),
            isDirty: true,
        })),

    insertBlock: (block, position) =>
        set((state) => {
            const next = [...state.blocks];
            const idx = position !== undefined
                ? Math.min(position, next.length)
                : next.length;
            next.splice(idx, 0, block);
            return { blocks: next, isDirty: true };
        }),

    deleteBlock: (id) =>
        set((state) => ({
            blocks: state.blocks.filter((b) => b.id !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
            isDirty: true,
        })),

    moveBlock: (id, direction) =>
        set((state) => {
            const idx = state.blocks.findIndex((b) => b.id === id);
            if (idx === -1) return state;
            const next = [...state.blocks];
            const targetIdx = direction === "up" ? idx - 1 : idx + 1;
            if (targetIdx < 0 || targetIdx >= next.length) return state;
            [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
            return { blocks: next, isDirty: true };
        }),

    reorderBlocks: (orderedIds) =>
        set((state) => {
            const map = new Map(state.blocks.map((b) => [b.id, b]));
            const next = orderedIds.map((id) => map.get(id)).filter(Boolean) as Block[];
            return { blocks: next, isDirty: true };
        }),

    markSaved: () => set({ isDirty: false }),
}));
