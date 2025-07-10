import {Section} from "@/types/Section";

export interface Module {
    id: string;
    title: string;
    path: string;
    iconName: string;
    description?: string;
    sections: Section[];
    color: string;
}