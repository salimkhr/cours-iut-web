'use client';

import dynamic from 'next/dynamic';
import modules from "../../data/modules";
import {notFound} from "next/navigation";

interface MDXRendererProps {
    mdxPath: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const mdxComponents: Record<string, () => Promise<any>> = {};

modules.forEach((module) => {
    module.sections.forEach((section) => {
        section.contents.forEach((content) => {
            const key = `${module.path}/${section.path}/${content.slug}`;
            const mdxPath = content.mdxPath;

            mdxComponents[key] = () => import(`@/mdx/${mdxPath}`);
        });
    });
});

export default function MDXRenderer({ mdxPath }: MDXRendererProps) {
    const loader = mdxComponents[mdxPath];

    if (!loader) {
        notFound();
    }

    const MDXContent = dynamic(() => loader().then(mod => mod.default), {
        loading: () => <p>Chargement du contenu...</p>,
        ssr: true,
    });

    return (
        <div className="prose mx-auto py-10">
            <MDXContent />
        </div>
    );
}
