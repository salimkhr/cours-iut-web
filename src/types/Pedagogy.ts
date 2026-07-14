import {ObjectId} from "bson";
import type {Block} from "@/types/CourseContent";
import type {VERDICT_FORMATS, EXEMPLAR_FORMATS, EXEMPLAR_LEVELS} from "@/lib/schemas/pedagogy.schema";

export type PedagogyFormat = (typeof VERDICT_FORMATS)[number];
export type ExemplarFormat = (typeof EXEMPLAR_FORMATS)[number];
export type ExemplarLevel = (typeof EXEMPLAR_LEVELS)[number];

/** Collection `pedagogy_verdicts` — la mémoire vivante du calibrage. */
export interface PedagogyVerdict {
    _id?: string | ObjectId;
    date: Date;
    format: PedagogyFormat;
    moduleSlug?: string;
    verdict: string;                 // critique utilisateur, verbatim
    status: "active" | "distilled";  // distilled = promu en invariant/annotation, retiré des lectures
}

/** Collection `pedagogy_exemplars` — les étalons promus. */
export interface PedagogyExemplar {
    _id?: string | ObjectId;
    date: Date;
    format: ExemplarFormat;
    moduleSlug: string;
    sectionSlug: string;
    level: ExemplarLevel;
    snapshot: Block[];               // copie figée des blocs à la promotion
    annotations: string[];           // notes « pourquoi c'est bon », validées à la promotion
}
