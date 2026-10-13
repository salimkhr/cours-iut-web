import type {ResourceKind} from "@/lib/schemas/resource.schema";

/** Ressource de veille, sérialisable (id et date en chaînes) pour le client. */
export interface Resource {
    _id: string;
    title: string;
    url: string;
    description: string;
    kind: ResourceKind;
    isVisible: boolean;
    createdAt: string;
    /** Temps de lecture / de visionnage, en minutes. */
    durationMin?: number;
    /** « Mot du prof », affiché sur la dernière ressource ajoutée. */
    note?: string;
}
