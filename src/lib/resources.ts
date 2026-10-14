import type {Collection, Document} from "mongodb";
import {resourceFormSchema} from "@/lib/schemas/resource.schema";

export const RESOURCES_COLLECTION = "resources";

export type AddResourceResult = {
    /** `duplicate` : l'URL existait déjà, rien n'a été écrit. */
    status: "created" | "duplicate";
    id: string;
    title: string;
};

/**
 * Ajoute une ressource de veille. Idempotent sur l'URL (coller deux fois le même mail ne duplique rien).
 * Les champs facultatifs absents ne sont pas écrits (pas de `null`). Lève une erreur si l'entrée est invalide.
 */
export async function addResource(
    collection: Collection<Document>,
    input: unknown,
    now: Date = new Date(),
): Promise<AddResourceResult> {
    const parsed = resourceFormSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error(`Ressource invalide : ${JSON.stringify(parsed.error.flatten())}`);
    }

    const existing = await collection.findOne({url: parsed.data.url}, {projection: {_id: 1, title: 1}});
    if (existing) {
        return {
            status: "duplicate",
            id: existing._id.toString(),
            title: typeof existing.title === "string" ? existing.title : parsed.data.title,
        };
    }

    const {durationMin, note, ...required} = parsed.data;
    const result = await collection.insertOne({
        ...required,
        ...(durationMin !== undefined && {durationMin}),
        ...(note !== undefined && {note}),
        isVisible: true,
        createdAt: now,
    });

    return {status: "created", id: result.insertedId.toString(), title: parsed.data.title};
}
