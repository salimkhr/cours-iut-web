import { create } from "zustand";
import type { Block } from "@/types/CourseContent";
import {
    findBlock,
    insertBlock as insertInTree,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
    moveBlock as moveInTree,
} from "@/lib/blockTreeUtils";

interface BuilderStore {
    blocks: Block[];
    selectedId: string | null;
    isDirty: boolean;
    setBlocks: (blocks: Block[]) => void;
    selectBlock: (id: string | null) => void;
    updateBlock: (id: string, props: Record<string, unknown>) => void;
    updateChildren: (id: string, children: Block[]) => void;
    insertBlock: (block: Block, parentId: string | null, index?: number) => void;
    deleteBlock: (id: string) => void;
    moveBlock: (id: string, targetParentId: string | null, targetIndex: number) => void;
    markSaved: () => void;
}

export const useBuilderStore = create<BuilderStore>()((set) => ({
    blocks: [],
    selectedId: null,
    isDirty: false,

    setBlocks: (blocks) => set({ blocks, isDirty: false }),

    selectBlock: (id) => set({ selectedId: id }),

    updateBlock: (id, props) =>
        set((state) => ({
            blocks: updateBlockProps(state.blocks, id, props),
            isDirty: true,
        })),

    updateChildren: (id, children) =>
        set((state) => ({
            blocks: updateBlockChildren(state.blocks, id, children),
            isDirty: true,
        })),

    insertBlock: (block, parentId, index) =>
        set((state) => {
            const idx = index ?? Number.MAX_SAFE_INTEGER; // clampé par le helper
            return {
                blocks: insertInTree(state.blocks, block, parentId, idx),
                isDirty: true,
            };
        }),

    deleteBlock: (id) =>
        set((state) => {
            const blocks = removeBlock(state.blocks, id);
            // Le bloc sélectionné peut être dans le sous-arbre supprimé.
            const selectedId = state.selectedId && findBlock(blocks, state.selectedId)
                ? state.selectedId
                : null;
            return { blocks, selectedId, isDirty: true };
        }),

    moveBlock: (id, targetParentId, targetIndex) =>
        set((state) => {
            const blocks = moveInTree(state.blocks, id, targetParentId, targetIndex);
            if (blocks === state.blocks) return state; // déplacement refusé
            return { blocks, isDirty: true };
        }),

    markSaved: () => set({ isDirty: false }),
}));
