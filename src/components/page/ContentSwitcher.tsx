import Link from "next/link";
import {BookOpen, Columns2, ExternalLink} from "lucide-react";
import {cn} from "@/lib/utils";
import {CONTENT_ICON, CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";

const SPLIT_KEY = 'split';
const SPLIT_LABEL = 'Côte à côte';

interface ContentSwitcherProps {
    contents: string[];
    currentContent: string;
    moduleSlug: string;
    sectionSlug: string;
    sectionTitle?: string;
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
                                            sectionTitle,
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
        <div className="w-full border-b border-border">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 flex items-stretch">
                {sectionTitle && (
                    <div className="hidden sm:flex items-center shrink-1 min-w-0 mr-4 border-b-2 border-transparent -mb-px">
                        <span className="text-sm text-brand-dark/50 dark:text-bridge-100/50 truncate">
                            {sectionTitle}
                        </span>
                    </div>
                )}

                <nav
                    aria-label="Types de contenu de la section"
                    className="flex items-stretch gap-0 sm:ml-auto overflow-x-auto"
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
                                    key === SPLIT_KEY && "hidden lg:inline-flex",
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
            </div>
        </div>
    );
}
