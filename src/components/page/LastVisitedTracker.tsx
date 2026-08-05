'use client';

import {useEffect} from 'react';
import {setLastVisitedSection} from '@/lib/lastVisited';

interface LastVisitedTrackerProps {
    modulePath: string;
    sectionPath: string;
}

/** Enregistre la section ouverte pour alimenter le CTA « Reprendre » du module. */
export default function LastVisitedTracker({modulePath, sectionPath}: LastVisitedTrackerProps) {
    useEffect(() => {
        setLastVisitedSection(modulePath, sectionPath);
    }, [modulePath, sectionPath]);

    return null;
}
