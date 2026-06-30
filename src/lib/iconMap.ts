import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function isValidIcon(name: string): boolean {
    return typeof (LucideIcons as Record<string, unknown>)[name] === "function";
}

export function getIcon(name: string): LucideIcon {
    if (isValidIcon(name)) return (LucideIcons as Record<string, unknown>)[name] as LucideIcon;
    return LucideIcons.BookOpen;
}

const iconMap = new Proxy({} as Record<string, LucideIcon>, {
    get(_, name: string) {
        return getIcon(name);
    },
});

export default iconMap;
