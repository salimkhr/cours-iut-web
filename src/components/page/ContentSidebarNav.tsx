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
        <nav
            aria-label="Changer de type de contenu"
            className="flex items-stretch gap-0"
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
                            "shrink-0 inline-flex items-center gap-1.5 px-3 h-9 text-sm font-medium",
                            "border-b-2 -mb-px transition-colors duration-200",
                            isActive
                                ? "text-brand-dark dark:text-bridge-50"
                                : "border-transparent text-brand-dark/55 dark:text-bridge-100/55 hover:text-brand-dark dark:hover:text-bridge-100 hover:border-border"
                        )}
                        style={isActive ? {borderColor: `var(--color-${moduleSlug})`} : undefined}
                    >
                        <Icon className="w-3.5 h-3.5 shrink-0"/>
                        <span>{label}</span>
                    </Link>
                );
            })}

            {contents.includes('slide') && (
                <>
                    <div className="h-4 w-px bg-border mx-1 shrink-0 self-center"/>
                    <a
                        href={`/${moduleSlug}/${sectionSlug}/slide`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ouvrir les slides dans un nouvel onglet"
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 h-9 text-sm font-medium border-b-2 border-transparent -mb-px transition-colors duration-200 text-brand-dark/55 dark:text-bridge-100/55 hover:text-brand-dark dark:hover:text-bridge-100 hover:border-border cursor-pointer"
                    >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0"/>
                        <span>Slides</span>
                    </a>
                </>
            )}
        </nav>
    );
}
