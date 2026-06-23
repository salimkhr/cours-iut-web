import React from "react";
import type { Block } from "@/types/CourseContent";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import { SlidesScreen } from "@/components/Slides/SlidesScreen";
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideCode } from "@/components/Slides/ui/SlideCode";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
import { renderInline } from "@/lib/inlineMarkdown";

interface SlideBlocksRendererProps {
    blocks: Block[];
    module: Module;
    section: Section;
}

export function SlideBlocksRenderer({ blocks, module, section }: SlideBlocksRendererProps) {
    const slideBlocks = blocks.filter((b) => b.type === "slide");

    return (
        <SlidesScreen module={module} section={section}>
            {slideBlocks.map((slide) => (
                <SlideScreen key={slide.id} title={String(slide.props.title ?? "")}>
                    {(slide.children ?? []).map((child) => (
                        <SlideBlockItem key={child.id} block={child} />
                    ))}
                </SlideScreen>
            ))}
        </SlidesScreen>
    );
}

function SlideBlockItem({ block }: { block: Block }) {
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
        case "columns": {
            return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {(block.children ?? []).map((col) => {
                        const span = Number(col.props.span) || 6;
                        const spanClass = COL_SPAN_CLASS[span] ?? `md:col-span-${span}`;
                        return (
                            <div
                                key={col.id}
                                className={`${spanClass} flex flex-col gap-4 min-w-0`}
                            >
                                {(col.children ?? []).map((inner) => (
                                    <SlideBlockItem key={inner.id} block={inner} />
                                ))}
                            </div>
                        );
                    })}
                </div>
            );
        }
        default:
            return null;
    }
}
