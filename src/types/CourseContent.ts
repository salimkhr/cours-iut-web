import { ObjectId } from "bson";

export type ContentRef =
    | { type: string; source: "file" }
    | { type: string; source: "db"; contentId: string };

export interface Block {
    id: string;
    type: string;
    props: Record<string, unknown>;
    colSpan?: "full" | "half";
}

export interface CourseContent {
    _id?: ObjectId | string;
    moduleSlug: string;
    sectionSlug: string;
    contentType: "cours" | "TP" | "examen";
    blocks: Block[];
    version: number;
    createdAt: Date;
    updatedAt: Date;
}

export function getContentTypes(contents: ContentRef[]): string[] {
    return contents.map(c => c.type);
}

export function hasContentType(contents: ContentRef[], type: string): boolean {
    return contents.some(c => c.type === type);
}

export function getContentRef(contents: ContentRef[], type: string): ContentRef | undefined {
    return contents.find(c => c.type === type);
}
