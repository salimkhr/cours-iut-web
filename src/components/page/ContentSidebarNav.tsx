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
}

export default function ContentSidebarNav({
                                              contents,
                                              currentContent,
                                              moduleSlug,
                                              sectionSlug,
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
        <div className="hidden 2xl:flex fixed top-[calc(var(--navbar-h)+16px)] right-2 z-20 flex-col">
            <nav
                aria-label="Changer de type de contenu"
                className="flex flex-col gap-0.5 rounded-xl border border-border bg-brand-light/90 dark:bg-brand-dark/90 backdrop-blur-sm shadow-md p-1"
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
                                "flex flex-col items-center gap-1 w-14 px-1 py-2.5 rounded-lg",
                                "text-[10px] font-semibold text-center leading-tight",
                                "transition-colors duration-200",
                                isActive
                                    ? "text-white"
                                    : "text-brand-dark/60 dark:text-bridge-100/60 hover:bg-bridge-300/50 dark:hover:bg-bridge-700/50 hover:text-brand-dark dark:hover:text-bridge-100"
                            )}
                            style={isActive ? {backgroundColor: `var(--color-${moduleSlug})`} : undefined}
                        >
                            <Icon className="w-4 h-4 shrink-0"/>
                            <span className="break-words w-full">{label}</span>
                        </Link>
                    );
                })}

                {contents.includes('slide') && (
                    <>
                        <div className="h-px bg-border mx-1 my-0.5"/>
                        <a
                            href={`/${moduleSlug}/${sectionSlug}/slide`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Ouvrir les slides dans un nouvel onglet"
                            className="flex flex-col items-center gap-1 w-14 px-1 py-2.5 rounded-lg text-[10px] font-semibold text-center leading-tight transition-colors duration-200 cursor-pointer text-brand-dark/60 dark:text-bridge-100/60 hover:bg-bridge-300/50 dark:hover:bg-bridge-700/50 hover:text-brand-dark dark:hover:text-bridge-100"
                        >
                            <ExternalLink className="w-4 h-4 shrink-0"/>
                            <span>Slides</span>
                        </a>
                    </>
                )}
            </nav>
        </div>
    );
}
