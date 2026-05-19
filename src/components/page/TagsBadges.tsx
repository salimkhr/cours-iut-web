import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

interface TagsBadgesProps {
    tags: string[];
    /** Kept for backward compatibility — no longer used for theming, kept neutral. */
    moduleTheme?: string;
    maxTags?: number;
    animationDelay?: string;
}

export default function TagsBadges({
                                       tags,
                                       maxTags = 8,
                                       animationDelay = '0.3s'
                                   }: TagsBadgesProps) {
    if (tags.length === 0) return null;

    return (
        <div
            className="flex flex-wrap justify-center gap-2 opacity-0 animate-fade-in-up"
            style={{animationDelay}}
        >
            {tags.slice(0, maxTags).map((tag) => (
                <Badge
                    key={tag}
                    className={cn(
                        "border-2 font-mono font-semibold text-sm px-3 py-1 rounded-md transition-colors",
                        "border-bridge-700/55 text-brand-dark bg-brand-light/70 hover:bg-bridge-700/10",
                        "dark:border-bridge-200/60 dark:text-bridge-50 dark:bg-brand-dark/70 dark:hover:bg-bridge-200/15"
                    )}
                >
                    #{tag}
                </Badge>
            ))}
        </div>
    );
}