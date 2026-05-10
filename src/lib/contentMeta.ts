import {BookOpen, CodeXml, FolderCode, GraduationCap, Presentation} from "lucide-react";

export const CONTENT_ORDER = ['cours', 'TP', 'slide', 'projet', 'examen'] as const;
export type ContentKey = typeof CONTENT_ORDER[number];

export const CONTENT_LABELS: Record<ContentKey, string> = {
    cours: 'Cours',
    TP: 'TP',
    slide: 'Slides',
    projet: 'Projet',
    examen: 'Examen',
};

export const CONTENT_DESC: Record<ContentKey, string> = {
    cours: 'Notions et concepts fondamentaux.',
    TP: 'Mise en pratique guidée, exercice par exercice.',
    slide: 'Présentation visuelle, navigation au clavier.',
    projet: 'Projet d\'application des acquis.',
    examen: 'Évaluation des compétences acquises.',
};

export const CONTENT_ICON: Record<ContentKey, React.ComponentType<{className?: string}>> = {
    cours: BookOpen,
    TP: CodeXml,
    slide: Presentation,
    projet: FolderCode,
    examen: GraduationCap,
};
