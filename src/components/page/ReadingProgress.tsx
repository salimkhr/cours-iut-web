'use client';

import { useEffect } from 'react';
import { useReadingProgressStore } from '@/lib/store/readingProgressStore';

interface ReadingProgressProps {
    modulePath?: string;
    accentColor?: string;
}

// Enregistre le modulePath dans le store global pour que NavBar puisse
// rendre la barre de progression depuis l'intérieur du <header>.
export default function ReadingProgress({ modulePath, accentColor }: ReadingProgressProps) {
    const setModulePath = useReadingProgressStore((s) => s.setModulePath);

    useEffect(() => {
        setModulePath(modulePath ?? null, accentColor ?? null);
        return () => setModulePath(null);
    }, [modulePath, accentColor, setModulePath]);

    return null;
}
