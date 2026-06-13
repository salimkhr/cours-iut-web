export interface Block {
    id: string;
    type: string;
    props: Record<string, unknown>;
    children?: Block[];
}
export declare function findBlock(blocks: Block[], id: string): Block | undefined;
export declare function findParent(blocks: Block[], id: string, parent?: Block | null): Block | null | undefined;
export declare function insertInTree(blocks: Block[], newBlock: Block, parentId: string | null, index: number): Block[];
export declare function removeFromTree(blocks: Block[], id: string): Block[];
export declare function updateProps(blocks: Block[], id: string, props: Record<string, unknown>): Block[];
export declare function reorderInParent(blocks: Block[], parentId: string | null, orderedIds: string[]): Block[];
export declare function createBlock(type: string, props: Record<string, unknown>, children?: Block[]): Block;
