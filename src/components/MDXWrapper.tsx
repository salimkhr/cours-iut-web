// components/MDXWrapper.tsx

import { useEffect, useState } from 'react';
import NotFound from "next/dist/client/components/not-found-error";

interface MDXWrapperProps {
    slug: string;
}

export default function MDXWrapper({ slug }: MDXWrapperProps) {
    const [MDXContent, setMDXContent] = useState<React.ComponentType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function loadMDX() {
            try {
                const mdxModule = await import(`@/mdx/${slug}.mdx`);
                setMDXContent(() => mdxModule.default);
            } catch {
                setError(true);
                NotFound();
            } finally {
                setLoading(false);
            }
        }

        loadMDX();
    }, [slug]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error || !MDXContent) {
        return <div>Content not found</div>;
    }

    return <MDXContent />;
}