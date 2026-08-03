"use client";

import React from "react";
import type {Block} from "@/types/CourseContent";
import {renderInline} from "@/lib/inlineMarkdown";
import {SlideCode} from "@/components/Slides/ui/SlideCode";
import {SlideDiagram} from "@/components/Slides/ui/SlideDiagram";
import {SlideList, SlideListItem} from "@/components/Slides/ui/SlideList";
import {SlideNote} from "@/components/Slides/ui/SlideNote";
import {SlideText} from "@/components/Slides/ui/SlideText";

const slideColumnSpanClass: Record<number, string> = {
    3: "md:col-span-3",
    4: "md:col-span-4",
    6: "md:col-span-6",
    8: "md:col-span-8",
    9: "md:col-span-9",
};

export function SlideBlockItem({block}: { block: Block }) {
    switch (block.type) {
        case "slide-text":
            return (
                <SlideText>
                    {renderInline(String(block.props.content ?? ""))}
                </SlideText>
            );
        case "slide-code":
            return (
                <SlideCode
                    language={String(block.props.language ?? "javascript")}
                    highlight={block.props.highlight ? String(block.props.highlight) : undefined}
                >
                    {String(block.props.code ?? "")}
                </SlideCode>
            );
        case "slide-list":
            return (
                <SlideList ordered={Boolean(block.props.ordered)}>
                    {(block.children ?? []).map((item) => (
                        <SlideListItem key={item.id}>
                            {renderInline(String(item.props.text ?? ""))}
                        </SlideListItem>
                    ))}
                </SlideList>
            );
        case "slide-note":
            return <SlideNote>{String(block.props.content ?? "")}</SlideNote>;
        case "diagram":
            return <SlideDiagram chart={String(block.props.chart ?? "")}/>;
        case "columns":
            return (
                <div className="grid min-h-0 grid-cols-1 md:grid-cols-12 gap-6">
                    {(block.children ?? []).map((col) => {
                        const span = Number(col.props.span) || 6;
                        const spanClass = slideColumnSpanClass[span] ?? "md:col-span-6";

                        return (
                            <div
                                key={col.id}
                                className={`${spanClass} flex flex-col gap-4 min-w-0 min-h-0`}
                            >
                                {(col.children ?? []).map((inner) => (
                                    <SlideBlockItem key={inner.id} block={inner}/>
                                ))}
                            </div>
                        );
                    })}
                </div>
            );
        default:
            return null;
    }
}
