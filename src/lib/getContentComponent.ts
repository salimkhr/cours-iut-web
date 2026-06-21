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

    // Rend le contenu stocké en base (course_content) s'il existe, sinon null.
    const renderDbIfPresent = async () => {
        const doc = await getContentBlocks(
            currentModule.path,
            currentSection.path,
            currentContent
        );
        if (!doc) return null;
        const blocks = doc.blocks;
        return function DbContent() {
            return React.createElement(BlockRenderer, { blocks });
        };
    };

    if (ref.source === "db") {
        const Component = await renderDbIfPresent();
        if (!Component) notFound();
        return Component;
    }

    // ref.source === "file" : on tente le composant .tsx ; à défaut (fichier
    // absent), on retombe sur un éventuel contenu db — la ref peut indiquer
    // "file" alors que le contenu vit en base (créé via le builder / le MCP).
    const componentKey =
        currentContent.charAt(0).toUpperCase() + currentContent.slice(1);

    const importFunc =
        contentImports?.[currentModule.path]?.[currentSection.path]?.[componentKey];

    if (typeof importFunc !== "function") {
        return await renderDbIfPresent();
    }

    const Component = (await importFunc()).default;

    if (!Component) return await renderDbIfPresent();

    return Component;
}
