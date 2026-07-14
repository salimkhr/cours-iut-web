import {ObjectId} from "bson";
import { ContentRef } from "@/types/CourseContent";
import type { SectionBrief, SectionCurriculum } from "@/lib/schemas/section.schema";

export default interface Section {
    _id?: string | ObjectId;
    title: string;
    path: string;
    description?: string;
    objectives?: string[];
    contents: ContentRef[];
    tags: string[];
    // Statistiques de la section
    totalDuration: number;          // nombre de séances (= sessionCount de la spec)
    courseIntroMinutes?: number;    // temps cours/slides en ouverture de la 1re séance
    brief?: SectionBrief;           // le prévu — écrit par le skill module-design
    curriculum?: SectionCurriculum; // le réalisé — mis à jour par content-writer
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    examenIsLock?: boolean;
}
