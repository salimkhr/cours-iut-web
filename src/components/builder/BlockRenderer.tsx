"use client";

import React from "react";
import type { Block } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";
import { namedComponents } from "@/lib/namedComponents";

function groupByColSpan(blocks: Block[]): Block[][] {
    const groups: Block[][] = [];
    let i = 0;

    while (i < blocks.length) {
        const block = blocks[i];
        if (block.colSpan === "half" && blocks[i + 1]?.colSpan === "half") {
            groups.push([block, blocks[i + 1]]);
            i += 2;
        } else {
            groups.push([block]);
            i += 1;
        }
    }

    return groups;
}

function BlockItem({ block }: { block: Block }) {
    if (block.type === "named-component") {
        const name = String(block.props?.name ?? "");
        const Component = namedComponents[name as keyof typeof namedComponents];
        if (!Component) {
            return (
                <div className="border border-dashed rounded p-4 text-muted-foreground text-sm">
                    ⚡ Composant introuvable : {name}
                </div>
            );
        }
        return <Component />;
    }

    const def = getBlockDefinition(block.type);
    if (!def) {
        return (
            <div className="border border-dashed rounded p-4 text-muted-foreground text-sm">
                Bloc inconnu : {block.type}
            </div>
        );
    }

    const Render = def.render;
    return <Render {...block.props} />;
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
    const groups = groupByColSpan(blocks);

    return (
        <article className="flex flex-col gap-6">
            {groups.map((group, groupIndex) =>
                group.length === 1 ? (
                    <BlockItem key={group[0].id} block={group[0]} />
                ) : (
                    <div
                        key={`group-${groupIndex}`}
                        className="grid grid-cols-2 gap-6"
                    >
                        {group.map((b) => (
                            <BlockItem key={b.id} block={b} />
                        ))}
                    </div>
                )
            )}
        </article>
    );
}
