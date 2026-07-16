import {connectToDB} from "@/lib/mongodb";
import Module from "@/types/Module";
import {CourseContent} from "@/types/CourseContent";
import {WithId} from "mongodb";

export interface ExportedContent {
    moduleSlug: string;
    sectionSlug: string;
    contentType: CourseContent["contentType"];
    blocks: CourseContent["blocks"];
    version: number;
}

export interface ExportPayload {
    version: 2;
    modules: Omit<Module, "_id">[];
    contents: ExportedContent[];
}

/**
 * Construit le payload d'export complet (modules + course_content), sans _id.
 * `modulePath` limite l'export à un seul module.
 */
export async function buildExportPayload(modulePath?: string): Promise<ExportPayload> {
    const db = await connectToDB();

    const moduleFilter = modulePath ? {path: modulePath} : {};
    const moduleDocs = await db.collection<Module>("modules")
        .find(moduleFilter)
        .toArray() as WithId<Module>[];

    const modules = moduleDocs.map(({_id, sections, ...rest}) => ({
        ...rest,
        sections: (sections ?? []).map(({_id: _sid, ...sec}) => sec),
    })) as Omit<Module, "_id">[];

    const contentFilter = modulePath ? {moduleSlug: modulePath} : {};
    const contentDocs = await db.collection<CourseContent>("course_content")
        .find(contentFilter)
        .toArray();

    const contents: ExportedContent[] = contentDocs.map((doc) => ({
        moduleSlug: doc.moduleSlug,
        sectionSlug: doc.sectionSlug,
        contentType: doc.contentType,
        blocks: doc.blocks ?? [],
        version: doc.version ?? 1,
    }));

    return {version: 2, modules, contents};
}
