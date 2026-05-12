import Link from "next/link";
import {BookOpen, Columns2} from "lucide-react";
import {cn} from "@/lib/utils";
import {CONTENT_ICON, CONTENT_LABELS, CONTENT_ORDER, ContentKey} from "@/lib/contentMeta";
import ReadingProgress from "@/components/page/ReadingProgress";

const SPLIT_KEY = 'split';
const SPLIT_LABEL = '' +
    'Côte à côte';

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

    if (tabs.length <= 1) return null;

    return (
        <div
            className={cn(
                "sticky top-(--navbar-h) z-30 w-full",
                // Même traitement visuel que la NavBar : fond transparent
                // + blur léger, pour que le contenu en dessous reste lisible.
                "bg-transparent backdrop-blur-xs",
                "border-b border-border"
            )}
        >
            {/* ReadingProgress collé en haut, au plus près de la navbar */}
            <ReadingProgress modulePath={moduleSlug}/>
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <nav
                    aria-label="Types de contenu de la section"
                    className="flex items-center gap-1 overflow-x-auto py-2"
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
                                    "shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold",
                                    "border transition-colors duration-200",
                                    key === SPLIT_KEY && "hidden lg:inline-flex",
                                    isActive
                                        ? "bg-brand-primary text-brand-light border-brand-primary shadow-sm"
                                        : "text-brand-dark/70 dark:text-bridge-100/70 border-transparent hover:text-brand-dark dark:hover:text-bridge-50 hover:bg-bridge-300/60 dark:hover:bg-bridge-700/60"
                                )}
                            >
                                <Icon className="w-4 h-4 shrink-0"/>
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
