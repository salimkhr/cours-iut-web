import { unstable_cache } from "next/cache";
import { connectToDB } from "@/lib/mongodb";
import type { CourseContent } from "@/types/CourseContent";

export function getContentBlocks(
    moduleSlug: string,
    sectionSlug: string,
    contentType: string
): Promise<CourseContent | null> {
    return unstable_cache(
        async () => {
            const db = await connectToDB();
            const typedType = contentType as CourseContent["contentType"];
            const doc = await db
                .collection<CourseContent>("course_content")
                .findOne({ moduleSlug, sectionSlug, contentType: typedType });
            if (!doc) return null;
            return { ...doc, _id: doc._id?.toString() };
        },
        [`content-${moduleSlug}-${sectionSlug}-${contentType}`],
        { tags: [`content:${moduleSlug}:${sectionSlug}:${contentType}`] }
    )();
}
