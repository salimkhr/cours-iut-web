import { BrainIcon } from "@/components/icons/brain";
import { TerminalIcon } from "@/components/icons/terminal";
import { GraduationCapIcon } from "@/components/icons/graduation-cap";
import { RocketIcon } from "@/components/icons/rocket";
import { LayersIcon } from "@/components/icons/layers";
import { ZapIcon } from "@/components/icons/zap";
import { WrenchIcon } from "@/components/icons/wrench";
import { CompassIcon } from "@/components/icons/compass";
import { CpuIcon } from "@/components/icons/cpu";
import { SearchIcon } from "@/components/icons/search";
import { BookTextIcon } from "@/components/icons/book-text";
import { TelescopeIcon } from "@/components/icons/telescope";
import type React from "react";

export interface SectionIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionIconComponent = React.ComponentType<any>;

export const SECTION_ICON_MAP: Record<string, SectionIconComponent> = {
    "brain": BrainIcon,
    "terminal": TerminalIcon,
    "graduation-cap": GraduationCapIcon,
    "rocket": RocketIcon,
    "layers": LayersIcon,
    "zap": ZapIcon,
    "wrench": WrenchIcon,
    "compass": CompassIcon,
    "cpu": CpuIcon,
    "search": SearchIcon,
    "book-text": BookTextIcon,
    "telescope": TelescopeIcon,
};

export const SECTION_ICON_LABELS: Record<string, string> = {
    "brain": "Concepts",
    "terminal": "Pratique CLI",
    "graduation-cap": "Objectifs",
    "rocket": "Introduction",
    "layers": "Architecture",
    "zap": "Astuces",
    "wrench": "Configuration",
    "compass": "Exploration",
    "cpu": "Programmation",
    "search": "Analyse",
    "book-text": "Cours",
    "telescope": "Découverte",
};
