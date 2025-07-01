export interface Content {
    id: string;
    title: string;
    slug: string;
    description: string;
    duration: number;
    type?: 'lesson' | 'exercise' | 'project';
    mdxPath: string;
    order: number;
    // Métadonnées optionnelles
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    prerequisites?: string[];
}