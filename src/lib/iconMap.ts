import type {LucideIcon} from "lucide-react";
import {BookOpen, Braces, Code, Server, ServerCog} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    Code: Code,
    Server: Server,
    Braces: Braces,
    BookOpen: BookOpen,
    CodeXml: Code,
    ServerCog: ServerCog,
    BracesIcon: Braces,
};

export const VALID_ICON_NAMES = Object.keys(iconMap) as string[];

export default iconMap;