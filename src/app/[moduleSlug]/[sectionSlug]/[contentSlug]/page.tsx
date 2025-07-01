import { notFound } from 'next/navigation';
import modules from "../../../../../data/modules";
import MDXRenderer from '@/components/MDXRenderer';

interface ContentPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
        contentSlug: string;
    }>;
}

export async function generateStaticParams() {
    const params: { moduleSlug: string; sectionSlug: string; contentSlug: string }[] = [];

    modules.forEach((module) => {
        module.sections.forEach((section) => {
            section.contents.forEach((content) => {
                params.push({
                    moduleSlug: module.path,
                    sectionSlug: section.path,
                    contentSlug: content.slug
                });
            });
        });
    });

    return params;
}

export async function generateMetadata({ params }: ContentPageProps) {
    const { moduleSlug, sectionSlug } = await params;
    const currentModule = modules.find(m => m.path === moduleSlug);
    const currentSection = currentModule?.sections.find(s => s.path === sectionSlug);

    if (!currentModule || !currentSection) {
        return { title: 'Module non trouvé' };
    }

    return {
        title: `${currentModule.title} | ${currentSection.title}`,
        description: currentModule.description || `Apprenez ${currentModule.title}`,
    };
}

export default async function Content({ params }: ContentPageProps) {
    const { moduleSlug, sectionSlug, contentSlug } = await params;
    const currentModule = modules.find(m => m.path === moduleSlug);
    if (!currentModule) notFound();

    const currentSection = currentModule.sections.find(s => s.path === sectionSlug);
    if (!currentSection) notFound();

    const currentContent = currentSection.contents.find(c => c.slug === contentSlug);
    if (!currentContent) notFound();

    // Exemple : 'html-css/01-introduction/exercise'
    const mdxPath = `${moduleSlug}/${sectionSlug}/${currentContent.slug}`;

    return <MDXRenderer mdxPath={mdxPath} />;
}
