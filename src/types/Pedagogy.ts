import {ObjectId} from "bson";
import type {Block} from "@/types/CourseContent";
import type {VERDICT_FORMATS, EXEMPLAR_FORMATS, EXEMPLAR_LEVELS} from "@/lib/schemas/pedagogy.schema";
import type {
    RETOUCHE_CONTENT_TYPES,
    RETOUCHE_OPERATIONS,
    RETOUCHE_STATUSES,
    RETOUCHE_TARGETS,
} from "@/lib/schemas/retouche.schema";

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

/** Collection `pedagogy_retouches` — le journal des retouches faites depuis l'app
 *  Claude sur un élément dont d'autres supports dépendent (spec § 9), lu par le
 *  workflow de propagation (spec § 8). */
export interface PedagogyRetouche {
    _id?: string | ObjectId;
    date: Date;
    moduleSlug: string;
    sectionSlug?: string;
    target: (typeof RETOUCHE_TARGETS)[number];
    contentType?: (typeof RETOUCHE_CONTENT_TYPES)[number];  // target = block
    blockId?: string;                                       // target = block
    blockType?: string;                                     // lu en base au moment du journal
    questionId?: string;                                    // target = quiz-question
    operation: (typeof RETOUCHE_OPERATIONS)[number];
    before: Record<string, unknown> | null;                 // envoyé par le modèle ; null pour un insert
    after: Record<string, unknown>;                         // lu en base par le serveur
    summary: string;
    dependencyNote: string;                                 // quels supports dépendent de l'élément retouché
    status: (typeof RETOUCHE_STATUSES)[number];
    processedAt?: Date;
    processedNote?: string;
}
