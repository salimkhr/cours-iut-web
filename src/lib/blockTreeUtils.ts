// src/lib/blockTreeUtils.ts
// Helpers purs et immuables sur l'arbre de blocs. Les nœuds non touchés
// par une opération conservent leur référence (perf re-render React).
import { v4 as uuidv4 } from "uuid";
import type { Block } from "@/types/CourseContent";

export function cloneBlockDeep(block: Block): Block {
    return {
        id: uuidv4(),
        type: block.type,
        props: { ...block.props },
        ...(block.children ? { children: block.children.map(cloneBlockDeep) } : {}),
    };
}

export function findBlock(blocks: Block[], id: string): Block | undefined {
    for (const block of blocks) {
        if (block.id === id) return block;
        if (block.children) {
            const found = findBlock(block.children, id);
            if (found) return found;
        }
    }
    return undefined;
}

/** Parent (null = racine) et index du bloc dans son parent. null si introuvable. */
export function findParent(
    blocks: Block[],
    id: string
): { parent: Block | null; index: number } | null {
    const index = blocks.findIndex((b) => b.id === id);
    if (index !== -1) return { parent: null, index };
    for (const block of blocks) {
        if (!block.children) continue;
        const childIndex = block.children.findIndex((c) => c.id === id);
        if (childIndex !== -1) return { parent: block, index: childIndex };
        const deep = findParent(block.children, id);
        if (deep) return deep;
    }
    return null;
}

export function isDescendant(blocks: Block[], ancestorId: string, id: string): boolean {
    const ancestor = findBlock(blocks, ancestorId);
    if (!ancestor?.children) return false;
    return findBlock(ancestor.children, id) !== undefined;
}

/** Applique `fn` au tableau d'enfants du parent visé, en ne reconstruisant
 *  que le chemin racine→parent. Renvoie le tableau d'origine si parent introuvable. */
function mapChildrenOf(
    blocks: Block[],
    parentId: string,
    fn: (children: Block[]) => Block[]
): Block[] {
    let changed = false;
    const next = blocks.map((block) => {
        if (block.id === parentId) {
            changed = true;
            return { ...block, children: fn(block.children ?? []) };
        }
        if (block.children) {
            const newChildren = mapChildrenOf(block.children, parentId, fn);
            if (newChildren !== block.children) {
                changed = true;
                return { ...block, children: newChildren };
            }
        }
        return block;
    });
    return changed ? next : blocks;
}

export function insertBlock(
    blocks: Block[],
    block: Block,
    parentId: string | null,
    index: number
): Block[] {
    const doInsert = (arr: Block[]): Block[] => {
        const next = [...arr];
        next.splice(Math.max(0, Math.min(index, next.length)), 0, block);
        return next;
    };
    if (parentId === null) return doInsert(blocks);
    return mapChildrenOf(blocks, parentId, doInsert);
}

export function removeBlock(blocks: Block[], id: string): Block[] {
    const loc = findParent(blocks, id);
    if (!loc) return blocks;
    if (loc.parent === null) return blocks.filter((b) => b.id !== id);
    return mapChildrenOf(blocks, loc.parent.id, (children) =>
        children.filter((c) => c.id !== id)
    );
}

export function updateBlockProps(
    blocks: Block[],
    id: string,
    props: Record<string, unknown>
): Block[] {
    let changed = false;
    const next = blocks.map((block) => {
        if (block.id === id) {
            changed = true;
            return { ...block, props: { ...block.props, ...props } };
        }
        if (block.children) {
            const newChildren = updateBlockProps(block.children, id, props);
            if (newChildren !== block.children) {
                changed = true;
                return { ...block, children: newChildren };
            }
        }
        return block;
    });
    return changed ? next : blocks;
}

export function updateBlockChildren(
    blocks: Block[],
    id: string,
    children: Block[]
): Block[] {
    return mapChildrenOf(blocks, id, () => children);
}

export function findAllIds(blocks: Block[]): string[] {
    const ids: string[] = [];
    for (const block of blocks) {
        ids.push(block.id);
        if (block.children) ids.push(...findAllIds(block.children));
    }
    return ids;
}

export function moveBlock(
    blocks: Block[],
    id: string,
    targetParentId: string | null,
    targetIndex: number
): Block[] {
    const block = findBlock(blocks, id);
    if (!block) return blocks;
    if (targetParentId !== null) {
        if (targetParentId === id) return blocks;
        if (isDescendant(blocks, id, targetParentId)) return blocks;
        if (!findBlock(blocks, targetParentId)) return blocks;
    }

    if (!findParent(blocks, id)) return blocks;

    // Sémantique arrayMove (dnd-kit) : targetIndex = position FINALE du bloc.
    // Le retrait préalable décale déjà les éléments suivants, donc aucune
    // correction d'index n'est nécessaire, même dans le même parent.
    const without = removeBlock(blocks, id);
    return insertBlock(without, block, targetParentId, targetIndex);
}
