import { contentImports } from "@/lib/contentImports";
import { notFound } from "next/navigation";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import { getContentRef } from "@/types/CourseContent";
import { getContentBlocks } from "@/lib/getContentBlocks";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import React from "react";

interface GetContentComponentArgs {
    currentModule: Module;
    currentSection: Section;
    currentContent: string;
}

export async function getContentComponent({
    currentModule,
    currentSection,
    currentContent,
}: GetContentComponentArgs) {
    const ref = getContentRef(currentSection.contents, currentContent);

    if (!ref) notFound();

    if (ref.source === "db") {
        const doc = await getContentBlocks(
            currentModule.path,
            currentSection.path,
            currentContent
        );

        if (!doc) notFound();

        const blocks = doc.blocks;
        return function DbContent() {
            return React.createElement(BlockRenderer, { blocks });
        };
    }

    const componentKey =
        currentContent.charAt(0).toUpperCase() + currentContent.slice(1);

    const importFunc =
        contentImports?.[currentModule.path]?.[currentSection.path]?.[componentKey];

    if (typeof importFunc !== "function") {
        return null;
    }

    const Component = (await importFunc()).default;

    if (!Component) return null;

    return Component;
}
