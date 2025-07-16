import {Content} from "@/types/content";

export interface Section {
    id: string;
    title: string;
    path: string;
    description?: string;
    contents: Content[];
    tags: string[];
    // Statistiques de la section
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable: boolean;
    order: number;
}