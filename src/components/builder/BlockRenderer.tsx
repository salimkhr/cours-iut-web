"use client";

import React from "react";
import type { Block } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";

function BlockItem({
    block,
    depth = 0,
    sectionIndex,
}: {
    block: Block;
    depth?: number;
    sectionIndex?: number;
}) {
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
    let sectionCounter = 0;
    const children = block.children?.map((child) => {
        const si = child.type === "section" ? sectionCounter++ : undefined;
        return <BlockItem key={child.id} block={child} depth={childDepth} sectionIndex={si} />;
    });

    return (
        <Render {...block.props} depth={depth} sectionIndex={sectionIndex}>
            {children}
        </Render>
    );
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
    let sectionCounter = 0;
    return (
        <article className="flex flex-col gap-6">
            {blocks.map((block) => {
                const si = block.type === "section" ? sectionCounter++ : undefined;
                return <BlockItem key={block.id} block={block} sectionIndex={si} />;
            })}
        </article>
    );
}
