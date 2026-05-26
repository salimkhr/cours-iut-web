import {ObjectId} from "bson";
import {QuizQuestion} from "@/types/Quiz";

export default interface Section {
    _id?: string | ObjectId;
    title: string;
    path: string;
    description?: string;
    objectives?: string[];
    contents: string[];
    tags: string[];
    // Statistiques de la section
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    examenIsLock?: boolean;
    quiz?: { questions: QuizQuestion[] };
}