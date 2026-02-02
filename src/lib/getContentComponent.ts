import {contentImports} from "@/lib/contentImports";
import {notFound} from "next/navigation";
import Module from "@/types/Module";
import Section from "@/types/Section";

interface GetContentComponentArgs {
    currentModule: Module;
    currentSection: Section;
    currentContent: string;
}

/**
 * Renvoie une référence de composant React correspondant au contenu demandé.
 * Ne renvoie jamais du JSX directement.
 */
export async function getContentComponent({
                                              currentModule,
                                              currentSection,
                                              currentContent,
                                          }: GetContentComponentArgs) {
    const componentKey =
        currentContent.charAt(0).toUpperCase() + currentContent.slice(1);

    const importFunc =
        contentImports?.[currentModule.path]?.[currentSection.path]?.[componentKey];

    if (typeof importFunc !== "function") {
        notFound();
    }

    const Component = (await importFunc()).default;

    if (!Component) notFound();

    return Component;
}