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

    const tabs = [
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
            }]
            : []),
    ];

    if (tabs.length <= 1 && !contents.includes('slide')) return null;

    return (
        <nav
            aria-label="Changer de type de contenu"
            className="flex items-center gap-0.5"
        >
            {tabs.map(({key, href, label, Icon}) => {
                const isActive = key === currentContent;
                return (
                    <Link
                        key={key}
                        href={href}
                        scroll={false}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            "shrink-0 inline-flex items-center gap-0.5 px-2 sm:px-1.5 h-11 sm:h-7 text-sm font-medium rounded-md",
                            "transition-[background-color,color,transform] duration-200 active:translate-y-px focus-visible:ring-2 focus-visible:ring-ring",
                            isActive
                                ? "text-white dark:text-brand-dark"
                                : "text-brand-dark/55 dark:text-bridge-100/55 hover:text-brand-dark dark:hover:text-bridge-100 hover:bg-bridge-300/40 dark:hover:bg-bridge-700/40"
                        )}
                        style={isActive ? {backgroundColor: accentColor ?? `var(--color-${moduleSlug})`} : undefined}
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
