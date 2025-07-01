import { getMdxFile, readMdxFile } from './mdx';
import { Module } from '@/types/module';
import {Content} from "@/types/content";

/**
 * Récupère un module par son ID
 */
export function getModuleById(modules: Module[], moduleId: string): Module | undefined {
    return modules.find(module => module.id === moduleId);
}

/**
 * Charge le contenu MDX d'un content
 */
export async function loadContentMdx(content: Content) {
    try {
        const filePath = getMdxFile(content.slug, content.mdxPath);
        const { frontMatter, content: mdxContent } = readMdxFile(filePath);

        return {
            ...content,
            frontMatter,
            mdxContent
        };
    } catch (error) {
        console.error(`Erreur lors du chargement de ${content.mdxPath}:`, error);
        return null;
    }
}