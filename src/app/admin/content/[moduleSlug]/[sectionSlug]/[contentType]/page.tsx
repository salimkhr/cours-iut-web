import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import { moduleColor } from "@/lib/moduleColor";
import { normalizeContentKey } from "@/lib/contentTypes";
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

    // Un type inconnu ouvrirait un builder vierge qui écrirait un document
    // orphelin en base ; une casse non canonique (`tp`) créerait un second
    // document invisible à côté du vrai (`TP`). On refuse le premier cas et on
    // redirige le second vers l'URL canonique.
    const canonicalType = normalizeContentKey(contentType);
    if (!canonicalType) notFound();
    if (canonicalType !== contentType) {
        redirect(`/admin/content/${moduleSlug}/${sectionSlug}/${canonicalType}`);
    }

    const db = await connectToDB();

    const mod = await db.collection<Module>("modules").findOne({ path: moduleSlug });
    if (!mod) notFound();

    const section = mod.sections?.find((s) => s.path === sectionSlug);
    if (!section) notFound();

    const doc = await db
        .collection<{ blocks?: Block[] }>("course_content")
        .findOne({ moduleSlug, sectionSlug, contentType: canonicalType });

    const ref = section.contents?.find((c: ContentRef) => c.type === canonicalType);
    const source = (ref?.source === "db" ? "db" : "file") as "file" | "db";

    return (
        <BuilderPageDynamic
            moduleSlug={moduleSlug}
            sectionSlug={sectionSlug}
            contentType={canonicalType}
            moduleTitle={mod.title ?? moduleSlug}
            sectionTitle={section.title ?? sectionSlug}
            initialBlocks={(doc?.blocks ?? []) as Block[]}
            source={source}
            declaredInSection={Boolean(ref)}
            colorLight={moduleColor(mod)}
            colorDark={moduleColor(mod, 'dark')}
        />
    );
}
