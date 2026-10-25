import Section from "@/types/Section";
import {ObjectId} from "bson";
import Instructor from "@/types/Instructor";
import Coefficient from "@/types/Coefficient";
import type {ModuleUniverse, ProjectSpec, ExampleDomain} from "@/lib/schemas/module.schema";

export type {ModuleUniverse, ProjectSpec, ExampleDomain};

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
    /** Ordre d'affichage (entier ≥ 1). Absent : le module passe après les modules ordonnés,
     *  dans l'ordre de création. Cf. `compareModules` (`@/lib/moduleOrder`). */
    order?: number;
    sessionDurationMinutes?: number;
    universe?: ModuleUniverse;
    projectIcon?: string;
    colorLight?: string;
    colorDark?: string;
    isVisible?: boolean;
    updatedAt?: string;
    projectSpec?: ProjectSpec;
    exampleDomain?: ExampleDomain;
    plannedNotions?: string[];
}