import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function isValidIcon(name: string): boolean {
    const icon = (LucideIcons as Record<string, unknown>)[name];
    return typeof icon === "function" || (typeof icon === "object" && icon !== null);
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
