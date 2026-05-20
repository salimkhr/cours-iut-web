import Link from "next/link";
import {BookOpen, Columns2, ExternalLink} from "lucide-react";
import {cn} from "@/lib/utils";
import {CONTENT_ICON, CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";
import ReadingProgress from "@/components/page/ReadingProgress";

const SPLIT_KEY = 'split';
const SPLIT_LABEL = 'Côte à côte';

interface ContentSwitcherProps {
    contents: string[];
    currentContent: string;
    moduleSlug: string;
    sectionSlug: string;
}

interface Tab {
    key: string;
    href: string;
    label: string;
    Icon: React.ComponentType<{className?: string}>;
}

export default function ContentSwitcher({
                                            contents,
                                            currentContent,
                                            moduleSlug,
                                            sectionSlug,
                                        }: ContentSwitcherProps) {
    const sorted = [...contents].sort(
        (a, b) => CONTENT_ORDER.indexOf(a as ContentKey) - CONTENT_ORDER.indexOf(b as ContentKey)
    );

    const tabs: Tab[] = sorted.filter(
        (content) => content !== 'slide'
    ).map((content) => {
        const key = content as ContentKey;
        return {
            key: content,
            href: `/${moduleSlug}/${sectionSlug}/${content}`,
            label: CONTENT_LABELS[key] ?? content,
            Icon: CONTENT_ICON[key] ?? BookOpen,
        };
    });

    if (contents.includes('cours') && contents.includes('TP')) {
        tabs.push({
            key: SPLIT_KEY,
            href: `/${moduleSlug}/${sectionSlug}/${SPLIT_KEY}`,
            label: SPLIT_LABEL,
            Icon: Columns2,
        });
    }

    if (tabs.length <= 1 && !contents.includes('slide')) return null;

    return (
        <div
            className={cn(
                "sticky top-(--navbar-h) z-30 w-full",
                "bg-transparent backdrop-blur-xs",
                "border-b border-border"
            )}
        >
            <ReadingProgress modulePath={moduleSlug}/>
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <nav
                    aria-label="Types de contenu de la section"
                    className="flex items-center gap-1 overflow-x-auto py-1"
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
                                    "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold",
                                    "border transition-colors duration-200",
                                    key === SPLIT_KEY && "hidden lg:inline-flex",
                                    isActive
                                        ? "bg-brand-primary text-brand-light border-brand-primary shadow-sm"
                                        : "text-brand-dark/70 dark:text-bridge-100/70 border-transparent hover:text-brand-dark dark:hover:text-bridge-50 hover:bg-bridge-300/60 dark:hover:bg-bridge-700/60"
                                )}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0"/>
                                <span>{label}</span>
                            </Link>
                        );
                    })}

                    {contents.includes('slide') && (
                        <>
                            <div className="h-4 w-px bg-border mx-1 shrink-0" aria-hidden="true"/>
                            <a
                                href={`/${moduleSlug}/${sectionSlug}/slide`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Ouvrir les slides dans un nouvel onglet"
                                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold border border-transparent transition-colors duration-200 text-brand-dark/70 dark:text-bridge-100/70 hover:text-brand-dark dark:hover:text-bridge-50 hover:bg-bridge-300/60 dark:hover:bg-bridge-700/60 cursor-pointer"
                            >
                                <ExternalLink className="w-3.5 h-3.5 shrink-0"/>
                                <span>Slides</span>
                            </a>
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
}
