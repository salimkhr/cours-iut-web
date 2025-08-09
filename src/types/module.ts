import {Section} from "@/types/Section";
import {ObjectId} from "bson";

export interface Module {
    _id: string | ObjectId;
    title: string;
    path: string;
    iconName: string;
    description?: string;
    sections: Section[];
}