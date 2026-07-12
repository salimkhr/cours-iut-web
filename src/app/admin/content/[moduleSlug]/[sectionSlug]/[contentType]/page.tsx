import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import { moduleColor } from "@/lib/moduleColor";
import { BuilderPageDynamic } from "@/components/builder/BuilderPageDynamic";
import type { Block, ContentRef } from "@/types/CourseContent";
import type Module from "@/types/Module";

interface PageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
        contentType: string;
    }>;
}

export default async function ContentBuilderPage({ params }: PageProps) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") notFound();

    const { moduleSlug, sectionSlug, contentType } = await params;

    const db = await connectToDB();

    const mod = await db.collection<Module>("modules").findOne({ path: moduleSlug });
    if (!mod) notFound();

    const section = mod.sections?.find((s) => s.path === sectionSlug);
    if (!section) notFound();

    const doc = await db
        .collection<{ blocks?: Block[] }>("course_content")
        .findOne({ moduleSlug, sectionSlug, contentType });

    const ref = section.contents?.find((c: ContentRef) => c.type === contentType);
    const source = (ref?.source === "db" ? "db" : "file") as "file" | "db";

    return (
        <BuilderPageDynamic
            moduleSlug={moduleSlug}
            sectionSlug={sectionSlug}
            contentType={contentType}
            moduleTitle={mod.title ?? moduleSlug}
            sectionTitle={section.title ?? sectionSlug}
            initialBlocks={(doc?.blocks ?? []) as Block[]}
            source={source}
            colorLight={moduleColor(mod)}
            colorDark={moduleColor(mod, 'dark')}
        />
    );
}
