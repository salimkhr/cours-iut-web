'use client';

import {useEffect, useState} from 'react';
import {Progress} from '@/components/ui/progress';
import {cn} from '@/lib/utils';

interface ReadingProgressProps {
    modulePath?: string;
}

export default function ReadingProgress({modulePath}: ReadingProgressProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let rafId: number | null = null;

        const update = () => {
            rafId = null;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const value = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
            setProgress(value);
        };

        const onScroll = () => {
            if (rafId === null) rafId = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, {passive: true});
        window.addEventListener('resize', onScroll, {passive: true});

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <Progress
            value={progress}
            aria-label="Progression de lecture"
            className={cn(
                "h-1.5 rounded-none bg-transparent",
                "[&>[data-slot=progress-indicator]]:bg-current",
                "[&>[data-slot=progress-indicator]]:transition-[transform] [&>[data-slot=progress-indicator]]:duration-150 [&>[data-slot=progress-indicator]]:ease-out"
            )}
            style={{
                color: modulePath
                    ? `var(--color-${modulePath})`
                    : 'var(--color-brand-primary)',
            }}
        />
    );
}
