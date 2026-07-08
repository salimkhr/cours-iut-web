import Section from "@/types/Section";
import {ObjectId} from "bson";
import Instructor from "@/types/Instructor";
import Coefficient from "@/types/Coefficient";
import type {ModuleUniverse} from "@/lib/schemas/module.schema";

export type {ModuleUniverse};

export default interface Module {
    _id: string | ObjectId;
    title: string;
    path: string;
    iconName: string;
    description?: string;
    sections: Section[];
    coefficients?: Coefficient[];
    instructors?: Instructor[];
    manager?: Instructor;
    associatedSae: string[];
    isExtra?: boolean;
    sessionDurationMinutes?: number;
    universe?: ModuleUniverse;
    colorLight?: string;
    colorDark?: string;
    updatedAt?: string;
}