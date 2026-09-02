import React from "react";
import type { Block } from "@/types/CourseContent";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import { SlidesScreen } from "@/components/Slides/SlidesScreen";
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { SlideBlockItem } from "@/components/Slides/SlideBlockItem";
import { computeSlideOrders } from "@/components/Slides/utils/slideOrder";
import { computeSlideStepCounts } from "@/components/Slides/utils/slideSteps";
import { computeSlideNotes } from "@/components/Slides/utils/slideNotes";

interface SlideBlocksRendererProps {
    blocks: Block[];
    module: Module;
    section: Section;
}

// `slide-screen` is the legacy container type emitted by the migration script.
export function isSlideContainerBlock(block: Block): boolean {
    return block.type === "slide" || block.type === "slide-screen";
}

/**
 * Une slide dont l'unique bloc est une transition se rend en pleine surface,
 * sans `SlideScreen` : elle porte son propre fond, repris de la garde de
 * section. La passer dans `SlideScreen` superposerait deux ponts et deux
 * dégradés, et lui imposerait des marges dont une garde n'a que faire.
 */
export function isTransitionSlide(slide: Block): boolean {
    const children = slide.children ?? [];
    return children.length === 1 && children[0].type === "slide-transition";
}

export function SlideBlocksRenderer({ blocks, module, section }: SlideBlocksRendererProps) {
    const slideBlocks = blocks.filter(isSlideContainerBlock);
    const titles = slideBlocks.map((slide) => String(slide.props.title ?? ""));
    const orders = computeSlideOrders(titles);

    const transitionIndices = slideBlocks
        .map((slide, index) => (isTransitionSlide(slide) ? index : -1))
        .filter((index) => index >= 0);
    const stepCounts = computeSlideStepCounts(slideBlocks);
    const notes = computeSlideNotes(slideBlocks);

    return (
        <SlidesScreen module={module} section={section} transitionIndices={transitionIndices} stepCounts={stepCounts} slideTitles={titles} slideNotes={notes}>
            {slideBlocks.map((slide, index) =>
                isTransitionSlide(slide) ? (
                    <SlideBlockItem key={slide.id} block={(slide.children ?? [])[0]} />
                ) : (
                    <SlideScreen key={slide.id} title={String(slide.props.title ?? "")} order={orders[index]}>
                        {(slide.children ?? []).map((child) => (
                            <SlideBlockItem key={child.id} block={child} />
                        ))}
                    </SlideScreen>
                )
            )}
        </SlidesScreen>
    );
}
