import {Badge} from "@/components/ui/badge";

interface TagsBadgesProps {
    tags: string[];
    moduleTheme: string;
    maxTags?: number;
    animationDelay?: string;
}

export default function TagsBadges({
                                       tags,
                                       moduleTheme,
                                       maxTags = 8,
                                       animationDelay = '0.3s'
                                   }: TagsBadgesProps) {
    if (tags.length === 0) return null;

    return (
        <div
            className="flex flex-wrap justify-center gap-2 mb-8 opacity-0 animate-fade-in-up"
            style={{animationDelay}}
        >
            {tags.slice(0, maxTags).map((tag) => (
                <Badge
                    key={tag}
                    className={`border-2 border-${moduleTheme} text-${moduleTheme} font-mono text-xs hover:bg-${moduleTheme} hover:text-white transition-colors`}
                >
                    #{tag}
                </Badge>
            ))}
        </div>
    );
}