import Link from "next/link";
import {ArrowLeft, ArrowRight, LayoutGrid} from "lucide-react";
import {cn} from "@/lib/utils";
import Section from "@/types/Section";

interface SectionPagerProps {
    moduleSlug: string;
    moduleTitle: string;
    prevSection: Section | null;
    nextSection: Section | null;
    accentColor: string;
    accentColorDark: string;
}

/**
 * Sortie de page d'un cours ou d'un TP.
 *
 * Sans elle, la fin du contenu débouchait directement sur le pied de page : pour
 * enchaîner sur le chapitre suivant il fallait remonter tout le document jusqu'au
 * lien de retour du hero.
 */
export default function SectionPager({
    moduleSlug,
    moduleTitle,
    prevSection,
    nextSection,
    accentColor,
    accentColorDark,
}: SectionPagerProps) {
    if (!prevSection && !nextSection) {
        return (
            <nav
                aria-label="Suite du module"
                className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-10 flex justify-center"
            >
                <BackToModule moduleSlug={moduleSlug} moduleTitle={moduleTitle}/>
            </nav>
        );
    }

    return (
        <nav
            aria-label="Suite du module"
            className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-10"
            style={{
                '--module-color': accentColor,
                '--module-color-dark': accentColorDark,
            } as React.CSSProperties}
        >
            <div className="border-t border-bridge-500/35 dark:border-bridge-500/25 pt-6 flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    {prevSection ? (
                        <PagerLink
                            href={`/${moduleSlug}/${prevSection.path}`}
                            direction="prev"
                            section={prevSection}
                        />
                    ) : (
                        <div className="hidden sm:block"/>
                    )}
                    {nextSection && (
                        <PagerLink
                            href={`/${moduleSlug}/${nextSection.path}`}
                            direction="next"
                            section={nextSection}
                        />
                    )}
                </div>
                <div className="flex justify-center">
                    <BackToModule moduleSlug={moduleSlug} moduleTitle={moduleTitle}/>
                </div>
            </div>
        </nav>
    );
}

function BackToModule({moduleSlug, moduleTitle}: {moduleSlug: string; moduleTitle: string}) {
    return (
        <Link
            href={`/${moduleSlug}`}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-brand-dark/70 dark:text-bridge-200/70 hover:text-brand-dark dark:hover:text-bridge-50 hover:bg-bridge-100 dark:hover:bg-bridge-800 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
            <LayoutGrid className="size-4 shrink-0"/>
            Tous les chapitres de {moduleTitle}
        </Link>
    );
}

function PagerLink({href, direction, section}: {href: string; direction: 'prev' | 'next'; section: Section}) {
    const isPrev = direction === 'prev';
    const Arrow = isPrev ? ArrowLeft : ArrowRight;

    return (
        <Link
            href={href}
            className={cn(
                "group/pager flex items-center gap-3 rounded-xl px-4 py-3 min-w-0",
                "bg-bridge-50 dark:bg-bridge-800",
                "border border-bridge-500/45 dark:border-bridge-500/35",
                "hover:border-(--module-color) dark:hover:border-(--module-color-dark)",
                "transition-all duration-300 hover:-translate-y-0.5 active:translate-y-px",
                "focus-visible:ring-2 focus-visible:ring-ring",
                !isPrev && "sm:col-start-2 flex-row-reverse text-right"
            )}
        >
            <Arrow
                className={cn(
                    "size-4 shrink-0 text-(--module-color) dark:text-(--module-color-dark) transition-transform duration-300",
                    isPrev ? "group-hover/pager:-translate-x-1" : "group-hover/pager:translate-x-1"
                )}
            />
            <span className="flex flex-col min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-brand-dark/60 dark:text-bridge-200/60">
                    {isPrev ? "Chapitre précédent" : "Chapitre suivant"}
                </span>
                <span className="text-sm font-semibold text-brand-dark dark:text-bridge-50 truncate">
                    {section.order}. {section.title}
                </span>
            </span>
        </Link>
    );
}
