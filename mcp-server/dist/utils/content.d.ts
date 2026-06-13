import type { Block } from "./tree.js";
interface ContentKey {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}
export declare function loadBlocks(key: ContentKey): Promise<Block[]>;
export declare function saveBlocks(key: ContentKey, blocks: Block[]): Promise<void>;
export {};
