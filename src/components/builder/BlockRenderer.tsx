"use client";

import React from "react";
import type { Block } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";

function BlockItem({ block, depth = 0 }: { block: Block; depth?: number }) {
    const def = getBlockDefinition(block.type);
    if (!def) {
        return (
            <div className="border border-dashed rounded p-3 text-sm text-muted-foreground">
                Bloc inconnu : {block.type}
            </div>
        );
    }

    const Render = def.render;
    const childDepth = block.type === "section" ? depth + 1 : depth;
    const children = block.children?.map((child) => (
        <BlockItem key={child.id} block={child} depth={childDepth} />
    ));

    return <Render {...block.props} depth={depth}>{children}</Render>;
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
    return (
        <article className="flex flex-col gap-6">
            {blocks.map((block) => (
                <BlockItem key={block.id} block={block} />
            ))}
        </article>
    );
}
