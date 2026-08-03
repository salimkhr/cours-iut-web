import React from "react";
import type { Block } from "@/types/CourseContent";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import { SlidesScreen } from "@/components/Slides/SlidesScreen";
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { SlideBlockItem } from "@/components/Slides/SlideBlockItem";
import { computeSlideOrders } from "@/components/Slides/utils/slideOrder";

interface SlideBlocksRendererProps {
    blocks: Block[];
    module: Module;
    section: Section;
}

// `slide-screen` is the legacy container type emitted by the migration script.
export function isSlideContainerBlock(block: Block): boolean {
    return block.type === "slide" || block.type === "slide-screen";
}

export function SlideBlocksRenderer({ blocks, module, section }: SlideBlocksRendererProps) {
    const slideBlocks = blocks.filter(isSlideContainerBlock);
    const orders = computeSlideOrders(slideBlocks.map((slide) => String(slide.props.title ?? "")));

    return (
        <SlidesScreen module={module} section={section}>
            {slideBlocks.map((slide, index) => (
                <SlideScreen key={slide.id} title={String(slide.props.title ?? "")} order={orders[index]}>
                    {(slide.children ?? []).map((child) => (
                        <SlideBlockItem key={child.id} block={child} />
                    ))}
                </SlideScreen>
            ))}
        </SlidesScreen>
    );
}
