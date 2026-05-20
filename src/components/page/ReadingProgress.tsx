'use client';

import { useEffect } from 'react';
import { useReadingProgressStore } from '@/lib/store/readingProgressStore';

interface ReadingProgressProps {
    modulePath?: string;
}

// Enregistre le modulePath dans le store global pour que NavBar puisse
// rendre la barre de progression depuis l'intérieur du <header>.
export default function ReadingProgress({ modulePath }: ReadingProgressProps) {
    const setModulePath = useReadingProgressStore((s) => s.setModulePath);

    useEffect(() => {
        setModulePath(modulePath ?? null);
        return () => setModulePath(null);
    }, [modulePath, setModulePath]);

    return null;
}
