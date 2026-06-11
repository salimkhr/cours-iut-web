"use client";

import React from "react";
import type { Block } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";

function BlockItem({ block }: { block: Block }) {
    const def = getBlockDefinition(block.type);
    if (!def) {
        return (
            <div className="border border-dashed rounded p-4 text-muted-foreground text-sm">
                Bloc inconnu : {block.type}
            </div>
        );
    }

    const Render = def.render;
    const children = block.children?.map((child) => (
        <BlockItem key={child.id} block={child} />
    ));

    return <Render {...block.props}>{children}</Render>;
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
