import {cache} from "react";
import {connectToDB} from "@/lib/mongodb";
import type {Resource} from "@/types/Resource";
import type {ResourceFormData} from "@/lib/schemas/resource.schema";

export const RESOURCES_COLLECTION = "resources";

type ResourceDoc = ResourceFormData & {isVisible: boolean; createdAt: Date};

/**
 * Ressources de veille, les plus récentes d'abord. `onlyVisible` pour la homepage
 * (étudiants), l'admin voit tout. Dédupliqué par `cache` au sein d'un rendu RSC.
 */
export const getResources = cache(async function getResources(onlyVisible: boolean): Promise<Resource[]> {
    const db = await connectToDB();
    const docs = await db
        .collection<ResourceDoc>(RESOURCES_COLLECTION)
        .find(onlyVisible ? {isVisible: true} : {})
        .sort({createdAt: -1})
        .toArray();

    return docs.map((doc) => ({
        _id: doc._id.toString(),
        title: doc.title,
        url: doc.url,
        description: doc.description,
        kind: doc.kind,
        isVisible: doc.isVisible,
        createdAt: new Date(doc.createdAt).toISOString(),
        // Champs facultatifs : absents (ou null selon l'écriture) → omis du résultat.
        ...(doc.durationMin ? {durationMin: doc.durationMin} : {}),
        ...(doc.note ? {note: doc.note} : {}),
    }));
});
