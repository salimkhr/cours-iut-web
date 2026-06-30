import {BookOpen, CodeXml, FolderCode, GalleryThumbnails, GraduationCap} from "lucide-react";

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
    slide: GalleryThumbnails,
    projet: FolderCode,
    examen: GraduationCap,
};

export const CONTENT_COPY_PREFIX: Partial<Record<ContentKey, string>> = {
    cours: `> **Contexte : Cours**\n> Explique les concepts, donne des exemples, vérifie la compréhension de l'étudiant.\n\n---\n\n`,
    TP: `> **Contexte : TP — exercice pratique**\n> Tu es un professeur. Guide l'étudiant par des questions et stimule sa réflexion. Ne fournis jamais de solution directe ni de code complet.\n\n---\n\n`,
};
