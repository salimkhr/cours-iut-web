import { v4 as uuidv4 } from "uuid";
export function findBlock(blocks, id) {
    for (const block of blocks) {
        if (block.id === id)
            return block;
        if (block.children) {
            const found = findBlock(block.children, id);
            if (found)
                return found;
        }
    }
    return undefined;
}
export function findParent(blocks, id, parent = null) {
    for (const block of blocks) {
        if (block.id === id)
            return parent;
        if (block.children) {
            const found = findParent(block.children, id, block);
            if (found !== undefined)
                return found;
        }
    }
    return undefined;
}
export function insertInTree(blocks, newBlock, parentId, index) {
    if (parentId === null) {
        const copy = [...blocks];
        copy.splice(Math.min(index, copy.length), 0, newBlock);
        return copy;
    }
    return blocks.map((block) => {
        if (block.id === parentId) {
            const children = [...(block.children ?? [])];
            children.splice(Math.min(index, children.length), 0, newBlock);
            return { ...block, children };
        }
        if (block.children) {
            return { ...block, children: insertInTree(block.children, newBlock, parentId, index) };
        }
        return block;
    });
}
export function removeFromTree(blocks, id) {
    return blocks
        .filter((b) => b.id !== id)
        .map((b) => b.children ? { ...b, children: removeFromTree(b.children, id) } : b);
}
export function updateProps(blocks, id, props) {
    return blocks.map((block) => {
        if (block.id === id)
            return { ...block, props: { ...block.props, ...props } };
        if (block.children) {
            return { ...block, children: updateProps(block.children, id, props) };
        }
        return block;
    });
}
export function reorderInParent(blocks, parentId, orderedIds) {
    if (parentId === null) {
        return sortChildren(blocks, orderedIds);
    }
    return blocks.map((block) => {
        if (block.id === parentId) {
            return { ...block, children: sortChildren(block.children ?? [], orderedIds) };
        }
        if (block.children) {
            return { ...block, children: reorderInParent(block.children, parentId, orderedIds) };
        }
        return block;
    });
}
function sortChildren(children, orderedIds) {
    const byId = new Map(children.map((c) => [c.id, c]));
    const reordered = orderedIds.flatMap((id) => (byId.has(id) ? [byId.get(id)] : []));
    const remaining = children.filter((c) => !orderedIds.includes(c.id));
    return [...reordered, ...remaining];
}
export function createBlock(type, props, children) {
    return { id: uuidv4(), type, props, ...(children !== undefined ? { children } : {}) };
}
