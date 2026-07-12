import { create } from "zustand";
import type { Block } from "@/types/CourseContent";
import {
    findBlock,
    findAllIds,
    findParent,
    cloneBlockDeep,
    insertBlock as insertInTree,
    removeBlock,
    moveBlock as moveBlockInTree,
    updateBlockProps,
    updateBlockChildren,
} from "@/lib/blockTreeUtils";

const MAX_HISTORY = 50;

interface BuilderStore {
    blocks: Block[];
    moduleSlug: string;
    moduleColorLight: string;
    moduleColorDark: string;
    contentType: string;
    selectedId: string | null;
    isDirty: boolean;
    blockErrors: Record<string, string>;
    collapsedIds: Record<string, true>;
    activeSlideId: string | null;
    editingBlockId: string | null;
    _history: Block[][];
    _future: Block[][];

    setBlocks: (blocks: Block[], moduleSlug?: string, contentType?: string, moduleColorLight?: string, moduleColorDark?: string) => void;
    selectBlock: (id: string | null) => void;
    setBlockErrors: (errors: Record<string, string>) => void;
    toggleCollapse: (id: string) => void;
    collapseAll: () => void;
    expandAll: () => void;
    duplicateBlock: (id: string) => void;
    moveBlockUp: (id: string) => void;
    moveBlockDown: (id: string) => void;
    moveBlockToIndex: (id: string, parentId: string | null, index: number) => void;
    setActiveSlide: (id: string | null) => void;
    setEditingBlock: (id: string | null) => void;
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
    moduleSlug: "",
    moduleColorLight: "",
    moduleColorDark: "",
    contentType: "",
    selectedId: null,
    isDirty: false,
    blockErrors: {},
    collapsedIds: {},
    activeSlideId: null,
    editingBlockId: null,
    _history: [],
    _future: [],

    setBlocks: (blocks, moduleSlug, contentType, moduleColorLight, moduleColorDark) =>
        set((s) => ({
            blocks,
            moduleSlug: moduleSlug ?? s.moduleSlug,
            moduleColorLight: moduleColorLight ?? s.moduleColorLight,
            moduleColorDark: moduleColorDark ?? s.moduleColorDark,
            contentType: contentType ?? s.contentType,
            isDirty: false,
            _history: [],
            _future: [],
        })),

    selectBlock: (id) => set({ selectedId: id }),

    setBlockErrors: (errors) => set({ blockErrors: errors }),

    toggleCollapse: (id) =>
        set((s) => {
            const next = { ...s.collapsedIds };
            if (next[id]) delete next[id];
            else next[id] = true;
            return { collapsedIds: next };
        }),

    collapseAll: () =>
        set((s) => {
            const ids = findAllIds(s.blocks);
            return { collapsedIds: Object.fromEntries(ids.map((id) => [id, true as const])) };
        }),

    expandAll: () => set({ collapsedIds: {} }),

    duplicateBlock: (id) =>
        set((s) => {
            const block = findBlock(s.blocks, id);
            const loc = findParent(s.blocks, id);
            if (!block || !loc) return s;
            const cloned = cloneBlockDeep(block);
            return {
                blocks: insertInTree(s.blocks, cloned, loc.parent?.id ?? null, loc.index + 1),
                selectedId: cloned.id,
                _history: pushHistory(s.blocks, s._history),
                _future: [],
                isDirty: true,
            };
        }),

    moveBlockUp: (id) =>
        set((s) => {
            const loc = findParent(s.blocks, id);
            if (!loc || loc.index === 0) return s;
            return {
                blocks: moveBlockInTree(s.blocks, id, loc.parent?.id ?? null, loc.index - 1),
                _history: pushHistory(s.blocks, s._history),
                _future: [],
                isDirty: true,
            };
        }),

    moveBlockDown: (id) =>
        set((s) => {
            const loc = findParent(s.blocks, id);
            if (!loc) return s;
            const siblingCount = loc.parent ? (loc.parent.children?.length ?? 0) : s.blocks.length;
            if (loc.index >= siblingCount - 1) return s;
            return {
                blocks: moveBlockInTree(s.blocks, id, loc.parent?.id ?? null, loc.index + 1),
                _history: pushHistory(s.blocks, s._history),
                _future: [],
                isDirty: true,
            };
        }),

    moveBlockToIndex: (id, parentId, index) =>
        set((s) => {
            const loc = findParent(s.blocks, id);
            const currentParentId = loc?.parent?.id ?? null;
            if (loc && currentParentId === parentId && loc.index === index) return s;
            return {
                blocks: moveBlockInTree(s.blocks, id, parentId, index),
                _history: pushHistory(s.blocks, s._history),
                _future: [],
                isDirty: true,
            };
        }),

    setActiveSlide: (id) => set({ activeSlideId: id }),

    setEditingBlock: (id) => set({ editingBlockId: id }),

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
        set((s) => {
            const blocks = removeBlock(s.blocks, id);
            const selectedId =
                s.selectedId && findBlock(blocks, s.selectedId)
                    ? s.selectedId
                    : null;
            return {
                blocks,
                selectedId,
                editingBlockId: s.editingBlockId === id ? null : s.editingBlockId,
                _history: pushHistory(s.blocks, s._history),
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

    markSaved: () => set({ isDirty: false, blockErrors: {} }),
}));
