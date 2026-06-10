import {ObjectId} from "bson";
import { ContentRef } from "@/types/CourseContent";

export default interface Section {
    _id?: string | ObjectId;
    title: string;
    path: string;
    description?: string;
    objectives?: string[];
    contents: ContentRef[];
    tags: string[];
    // Statistiques de la section
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    examenIsLock?: boolean;
}