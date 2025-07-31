import {Content} from "@/types/content";

export interface Section {
    id: number;
    title: string;
    path: string;
    description?: string | null;
    contents: Content[];
    tags: string;
    // Statistiques de la section
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable: boolean;
    order: number;
}