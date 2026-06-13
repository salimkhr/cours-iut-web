"use client";

import { getBlockDefinition } from "@/lib/blockRegistry";
import { DynamicPropsEditor } from "@/components/builder/DynamicPropsEditor";
import { useBuilderStore } from "@/lib/store/builderStore";
import type { Block } from "@/types/CourseContent";

interface BlockFormProps {
    blockId: string;
}

function findInTree(blocks: Block[], id: string): Block | undefined {
    for (const b of blocks) {
        if (b.id === id) return b;
        if (b.children) {
            const found = findInTree(b.children, id);
            if (found) return found;
        }
    }
    return undefined;
}

export function BlockForm({ blockId }: BlockFormProps) {
    const block = useBuilderStore((s) => findInTree(s.blocks, blockId));
    const updateBlock = useBuilderStore((s) => s.updateBlock);

    if (!block) return null;

    const def = getBlockDefinition(block.type);
    if (!def || def.fields.length === 0) {
        return (
            <p className="text-xs text-bridge-500 dark:text-bridge-400 px-3 py-2">
                Aucune prop à éditer pour ce type.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-3 px-3 py-2">
            <DynamicPropsEditor
                fields={def.fields}
                props={block.props}
                onChange={(newProps) => updateBlock(blockId, newProps)}
            />
        </div>
    );
}
