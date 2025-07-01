import {Content} from "@/types/content";

export interface Section {
    id: string;
    title: string;
    path: string;
    description?: string;
    contents: Content[];
    // Statistiques de la section
    totalDuration: number;
    contentTypes: string[];
    contentsCount: number;
    order: number;
}