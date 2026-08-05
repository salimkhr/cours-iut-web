import Link from "next/link";
import {BookOpen, Columns2, ExternalLink} from "lucide-react";
import {cn} from "@/lib/utils";
import {CONTENT_ICON, CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";

const SPLIT_KEY = 'split';

interface ContentSidebarNavProps {
    contents: string[];
    currentContent: string;
    moduleSlug: string;
    sectionSlug: string;
    accentColor?: string;
}

export default function ContentSidebarNav({
                                              contents,
                                              currentContent,
                                              moduleSlug,
                                              sectionSlug,
                                              accentColor,
                                          }: ContentSidebarNavProps) {
    const sorted = [...contents].sort(
        (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
    );

    interface Tab {
        key: string;
        href: string;
        label: string;
        Icon: React.ComponentType<{ className?: string }>;
        /** Classes de visibilité quand l'onglet n'a de sens qu'au-delà d'une largeur. */
        minBreakpoint?: string;
        title?: string;
        /** Onglet signalé par un contour : un mode à découvrir, pas un doublon. */
        highlight?: boolean;
    }

    const tabs: Tab[] = [
        ...sorted
            .filter((c) => c !== 'slide')
            .map((content) => {
                const key = content as ContentKey;
                return {
                    key: content,
                    href: `/${moduleSlug}/${sectionSlug}/${content}`,
                    label: CONTENT_LABELS[key] ?? content,
                    Icon: CONTENT_ICON[key] ?? BookOpen,
                };
            }),
        ...(contents.includes('cours') && contents.includes('TP')
            ? [{
                key: SPLIT_KEY,
                href: `/${moduleSlug}/${sectionSlug}/${SPLIT_KEY}`,
                label: 'Côte à côte',
                Icon: Columns2,
                // La vue split est `lg:flex-row` : sous 1024 px les deux panneaux
                // s'empilent et l'onglet promet un côte-à-côte qui n'arrive jamais.
                minBreakpoint: 'hidden lg:inline-flex',
                // C'est le mode le plus utile en salle de TP (énoncé et cours en
                // vis-à-vis) mais rien ne le distinguait des autres onglets.
                title: 'Afficher le cours et le TP en vis-à-vis',
                highlight: true,
            }]
            : []),
    ];

    if (tabs.length <= 1 && !contents.includes('slide')) return null;

    return (
        <nav
            aria-label="Changer de type de contenu"
            className="flex items-center gap-0.5"
        >
            {tabs.map(({key, href, label, Icon, minBreakpoint, title, highlight}) => {
                const isActive = key === currentContent;
                return (
                    <Link
                        key={key}
                        href={href}
                        // `ScrollRestore` replace la page à sa propre position de
                        // lecture : Next ne doit pas remonter en haut au passage.
                        scroll={false}
                        title={title}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            "shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-2 h-11 sm:h-8 text-sm font-medium rounded-md",
                            minBreakpoint,
                            "transition-[background-color,color,transform] duration-200 active:translate-y-px focus-visible:ring-2 focus-visible:ring-ring",
                            isActive
                                ? "text-white dark:text-brand-dark"
                                : "text-brand-dark/55 dark:text-bridge-100/55 hover:text-brand-dark dark:hover:text-bridge-100 hover:bg-bridge-300/40 dark:hover:bg-bridge-700/40",
                            highlight && !isActive && "border border-dashed text-brand-dark/75 dark:text-bridge-100/75"
                        )}
                        style={
                            isActive
                                ? {backgroundColor: accentColor ?? `var(--color-${moduleSlug})`}
                                : highlight
                                    ? {borderColor: accentColor ?? `var(--color-${moduleSlug})`}
                                    : undefined
                        }
                    >
                        <Icon className="size-4 sm:size-3.5 shrink-0"/>
                        <span>{label}</span>
                    </Link>
                );
            })}

            {contents.includes('slide') && (
                <>
                    <div className="h-4 w-px bg-border mx-0.5 shrink-0"/>
                    <a
                        href={`/${moduleSlug}/${sectionSlug}/slide`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ouvrir les slides dans un nouvel onglet"
                        className="shrink-0 inline-flex items-center gap-1.5 px-2.5 h-11 sm:h-7 text-sm font-medium rounded-md transition-[background-color,color,transform] duration-200 cursor-pointer text-brand-dark/55 dark:text-bridge-100/55 hover:text-brand-dark active:translate-y-px focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-bridge-100 hover:bg-bridge-300/40 dark:hover:bg-bridge-700/40"
                    >
                        <ExternalLink className="size-4 sm:size-3.5 shrink-0"/>
                        <span>Slides</span>
                    </a>
                </>
            )}
        </nav>
    );
}
