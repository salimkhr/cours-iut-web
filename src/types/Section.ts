import {ObjectId} from "bson";

export default interface Section {
    _id?: string | ObjectId;
    title: string;
    path: string;
    description?: string;
    contents: string[];
    tags: string[];
    // Statistiques de la section
    totalDuration: number;
    hasCorrection: boolean;
    isAvailable?: boolean;
    correctionIsAvailable?: boolean;
    order: number;
    examenIsLock?: boolean;
}