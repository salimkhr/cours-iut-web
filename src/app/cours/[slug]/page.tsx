import { getAllMdxFiles } from '@/lib/mdx';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const slugs = getAllMdxFiles();
    return slugs.map(slug => ({ slug }));
}

export default async function Page({ params }: { params: { slug: string } }) {
    const slug = params.slug;

    try {
         const MDXContent = (await import((`../../../mdx/${slug}.mdx`)) ).default;

        return (
            <div className="prose mx-auto py-10">
                <MDXContent />
            </div>
        );
    } catch (error) {
        notFound();
    }
}
