import Module from "@/types/module";
import Section from "@/types/Section";
import {Metadata} from "next";

export function generatePageMetadata({
                                         currentModule,
                                         currentSection,
                                         defaultTitle = 'Module non trouvé'
                                     }: {
    currentModule?: Module;
    currentSection?: Section;
    defaultTitle?: string;
}): Metadata {
    if (!currentModule) {
        return {title: defaultTitle};
    }

    if (!currentSection) {
        return {
            title: currentModule.title,
            description: currentModule.description,
        };
    }

    return {
        title: `${currentModule.title} | ${currentSection.title}`,
        description: currentModule.description || `Apprenez ${currentModule.title}`,
    };
}