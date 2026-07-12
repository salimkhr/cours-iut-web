'use client';

import {useEffect, useState} from 'react';
import {useReadingProgressStore} from '@/lib/store/readingProgressStore';
export default function NavReadingProgress() {
    const modulePath = useReadingProgressStore((s) => s.modulePath);
    const accentColor = useReadingProgressStore((s) => s.accentColor);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!modulePath) return;

        let rafId: number | null = null;

        const update = () => {
            rafId = null;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
        };

        const onScroll = () => {
            if (rafId === null) rafId = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [modulePath]);

    if (!modulePath) return null;

    return (
        <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[5px] origin-left transition-[width] duration-150 ease-out"
            style={{
                width: `${progress}%`,
                backgroundColor: accentColor ?? undefined,
            }}
        />
    );
}
