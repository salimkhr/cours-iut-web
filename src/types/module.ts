import Section from "@/types/Section";
import {ObjectId} from "bson";
import Instructor from "@/types/Instructor";
import Coefficient from "@/types/Coefficient";

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
}