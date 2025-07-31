import {Section} from "@/types/Section";

export interface Module {
    id: number;
    title: string;
    path: string;
    iconName: string;
    description: string | null;
    sections: Section[];
}