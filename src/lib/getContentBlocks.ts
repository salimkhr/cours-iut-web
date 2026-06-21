import { connectToDB } from "@/lib/mongodb";
import type { CourseContent } from "@/types/CourseContent";

/**
 * Lit le contenu (blocs) d'un cours/TP/examen depuis la base.
 *
 * Lecture FRAÎCHE à chaque appel (pas d'`unstable_cache`) : la page de cours est
 * déjà rendue dynamiquement (session par requête), donc un cache n'apporte rien
 * et provoquait des contenus périmés — `revalidateTag` ne se propage pas de façon
 * fiable en déploiement multi-instances. Un `findOne` indexé est négligeable.
 */
export async function getContentBlocks(
    moduleSlug: string,
    sectionSlug: string,
    contentType: string
): Promise<CourseContent | null> {
    const db = await connectToDB();
    const typedType = contentType as CourseContent["contentType"];
    const doc = await db
        .collection<CourseContent>("course_content")
        .findOne({ moduleSlug, sectionSlug, contentType: typedType });
    if (!doc) return null;
    return { ...doc, _id: doc._id?.toString() };
}
