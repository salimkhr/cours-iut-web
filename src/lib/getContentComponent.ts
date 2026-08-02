import { contentImports } from "@/lib/contentImports";
import { notFound } from "next/navigation";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import { getContentRef } from "@/types/CourseContent";
import { getContentBlocks } from "@/lib/getContentBlocks";
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

        // Import dynamique : BlockRenderer tire blockRegistry.tsx, dont les blocs
        // "diagram" (Mermaid) et l'éditeur de tableau du builder. getContentComponent
        // est appelé par la page qui gère TOUTES les routes de cours (fichier .tsx
        // ou DB) — un import statique ici ferait entrer ce module dans le graphe de
        // CHAQUE page de cours, y compris celles sans blocs DB, ce que Next.js
        // traduit par des balises <script async> injectées au premier chargement.
        const { BlockRenderer } = await import("@/components/builder/BlockRenderer");
        const blocks = doc.blocks;
        return function DbContent() {
            return React.createElement(BlockRenderer, { blocks, currentModule });
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
