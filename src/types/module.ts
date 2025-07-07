import {Section} from "@/types/Section";

export interface Module {
    id: string;
    title: string;
    path: string;
    iconName: string;
    description?: string;
    sections: Section[];
    color: string;
    // Statistiques du module
    sectionsCount: number;
    totalContents: number;
    totalDuration: number;
    contentTypes: string[];
}