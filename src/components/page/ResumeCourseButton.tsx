'use client';

import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLastVisitedSection} from '@/lib/lastVisited';

export interface ResumeTarget {
    path: string;
    label: string;
}

interface ResumeCourseButtonProps {
    modulePath: string;
    accentColor: string;
    accentColorDark: string;
    /** Sections disponibles, dans l'ordre pédagogique. */
    sections: ResumeTarget[];
}

/**
 * « Commencer le cours » tant que rien n'a été ouvert, « Reprendre » ensuite.
 *
 * Le rendu serveur pointe toujours sur la première section : c'est le bon défaut
 * pour un étudiant qui découvre le module, et il n'y a pas de saut d'hydratation
 * puisque la reprise n'est résolue qu'au montage.
 */
export default function ResumeCourseButton({
    modulePath,
    accentColor,
    accentColorDark,
    sections,
}: ResumeCourseButtonProps) {
    const first = sections[0];
    const last = useLastVisitedSection(modulePath);
    // La section mémorisée peut avoir été dépubliée ou renommée depuis.
    const match = last ? sections.find((s) => s.path === last) : undefined;
    const resume = match && match.path !== first?.path ? match : null;

    if (!first) return null;

    const target = resume ?? first;

    return (
        <Button
            asChild
            variant="outline"
            size="lg"
            style={{
                '--module-color': accentColor,
                '--module-color-dark': accentColorDark,
            } as React.CSSProperties}
            className="group h-auto max-w-full rounded-lg border-[3px] border-(--module-color) bg-transparent text-brand-dark dark:text-brand-light hover:bg-(--module-color) hover:text-white hover:border-(--module-color) dark:hover:text-brand-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-none transition-all duration-300"
        >
            <Link href={`/${modulePath}/${target.path}`}>
                <span className="truncate">
                    {resume ? `Reprendre — ${resume.label}` : 'Commencer le cours'}
                </span>
                <ArrowRight
                    aria-hidden="true"
                    strokeWidth={3}
                    className="size-4 shrink-0 text-(--module-color) group-hover:text-white dark:group-hover:text-brand-dark transition-all duration-300 group-hover:translate-x-1"
                />
            </Link>
        </Button>
    );
}
