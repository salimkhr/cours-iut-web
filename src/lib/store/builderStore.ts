import { create } from "zustand";
import type { Block } from "@/types/CourseContent";
import {
    findBlock,
    insertBlock as insertInTree,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
} from "@/lib/blockTreeUtils";

const MAX_HISTORY = 50;

interface BuilderStore {
    blocks: Block[];
    selectedId: string | null;
    isDirty: boolean;
    _history: Block[][];
    _future: Block[][];

    setBlocks: (blocks: Block[]) => void;
    selectBlock: (id: string | null) => void;
    updateBlock: (id: string, props: Record<string, unknown>) => void;
    updateChildren: (id: string, children: Block[]) => void;
    insertBlock: (block: Block, parentId: string | null, index?: number) => void;
    deleteBlock: (id: string) => void;
    undo: () => void;
    redo: () => void;
    markSaved: () => void;
}

function pushHistory(
    current: Block[],
    history: Block[][],
): Block[][] {
    return [...history, current].slice(-MAX_HISTORY);
}

export const useBuilderStore = create<BuilderStore>()((set) => ({
    blocks: [],
    selectedId: null,
    isDirty: false,
    _history: [],
    _future: [],

    setBlocks: (blocks) =>
        set({ blocks, isDirty: false, _history: [], _future: [] }),

    selectBlock: (id) => set({ selectedId: id }),

    updateBlock: (id, props) =>
        set((state) => ({
            blocks: updateBlockProps(state.blocks, id, props),
            _history: pushHistory(state.blocks, state._history),
            _future: [],
            isDirty: true,
        })),

    updateChildren: (id, children) =>
        set((state) => ({
            blocks: updateBlockChildren(state.blocks, id, children),
            _history: pushHistory(state.blocks, state._history),
            _future: [],
            isDirty: true,
        })),

    insertBlock: (block, parentId, index) =>
        set((state) => ({
            blocks: insertInTree(state.blocks, block, parentId, index ?? Number.MAX_SAFE_INTEGER),
            _history: pushHistory(state.blocks, state._history),
            _future: [],
            isDirty: true,
        })),

    deleteBlock: (id) =>
        set((state) => {
            const blocks = removeBlock(state.blocks, id);
            const selectedId =
                state.selectedId && findBlock(blocks, state.selectedId)
                    ? state.selectedId
                    : null;
            return {
                blocks,
                selectedId,
                _history: pushHistory(state.blocks, state._history),
                _future: [],
                isDirty: true,
            };
        }),

    undo: () =>
        set((state) => {
            if (state._history.length === 0) return state;
            const _history = [...state._history];
            const blocks = _history.pop()!;
            return {
                blocks,
                _history,
                _future: [...state._future, state.blocks],
                isDirty: true,
            };
        }),

    redo: () =>
        set((state) => {
            if (state._future.length === 0) return state;
            const _future = [...state._future];
            const blocks = _future.pop()!;
            return {
                blocks,
                _future,
                _history: [...state._history, state.blocks],
                isDirty: true,
            };
        }),

    markSaved: () => set({ isDirty: false }),
}));
