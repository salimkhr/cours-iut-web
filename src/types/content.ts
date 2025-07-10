export interface Content {
    id: string;
    title: string;
    slug: string;
    description: string;
    duration: number;
    type?: 'cours' | 'TP' | 'project';
    componentPath: string;
    order: number;
    // Métadonnées optionnelles
    tags?: string[];
    difficulty?: 'débutant' | 'intermédiaire' | 'avancé';
    prerequisites?: string[];
}