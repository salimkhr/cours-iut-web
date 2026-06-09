import {NextResponse} from 'next/server';
import {connectToDB} from "@/lib/mongodb";
import Module from "@/types/Module";
import {ObjectId} from "bson";
import {withAdmin} from "@/lib/withAdmin";
import {sectionApiSchema} from "@/lib/schemas/section.schema";
import {z} from "zod";
import { ContentRef } from "@/types/CourseContent";

export const POST = withAdmin(async (
    req: Request,
    context: { params: Promise<{ moduleId: string }> }
) => {
    try {
        const {moduleId} = await context.params;

        const parsed = sectionApiSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
        }
        const rawSection = parsed.data;
        const section = {
            ...rawSection,
            contents: rawSection.contents.map((type): ContentRef => ({ type, source: "file" })),
        };

        const db = await connectToDB();

        const result = await db.collection<Module>('modules').updateOne(
            {_id: new ObjectId(moduleId)},
            {$push: {sections: section}}
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({error: 'Module introuvable'}, {status: 404});
        }

        return NextResponse.json({success: true, section});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
});

export const PUT = withAdmin(async (
    req: Request,
    context: { params: Promise<{ moduleId: string }> }
) => {
    try {
        const {moduleId} = await context.params;

        const putSchema = sectionApiSchema.extend({sectionId: z.string()});
        const parsed = putSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({error: parsed.error.flatten()}, {status: 400});
        }
        const {sectionId, ...updatedSection} = parsed.data;

        const db = await connectToDB();

        // Récupérer le module pour obtenir l'ancienne section
        const currentModule = await db.collection<Module>('modules').findOne({
            _id: new ObjectId(moduleId)
        });

        if (!currentModule) {
            return NextResponse.json({error: 'Module introuvable'}, {status: 404});
        }

        // Trouver l'ancienne section pour comparaison
        const oldSectionIndex = currentModule.sections.findIndex(section => section.path === updatedSection.path);

        if (oldSectionIndex === -1) {
            return NextResponse.json({error: 'Section introuvable'}, {status: 404});
        }

        const oldSection = currentModule.sections[oldSectionIndex];

        // Préserver les sources existantes (ne pas écraser source:"db" par "file")
        const mergedContents = updatedSection.contents.map((type): ContentRef => {
            const existing = (oldSection.contents ?? []).find((c) => c.type === type);
            return existing ?? { type, source: "file" };
        });

        // Mettre à jour la section dans la base de données
        const result = await db.collection<Module>('modules').updateOne(
            {
                _id: new ObjectId(moduleId),
                'sections._id': sectionId
            },
            {
                $set: {
                    [`sections.${oldSectionIndex}.title`]: updatedSection.title,
                    [`sections.${oldSectionIndex}.path`]: updatedSection.path,
                    [`sections.${oldSectionIndex}.description`]: updatedSection.description,
                    [`sections.${oldSectionIndex}.objectives`]: updatedSection.objectives,
                    [`sections.${oldSectionIndex}.tags`]: updatedSection.tags,
                    [`sections.${oldSectionIndex}.totalDuration`]: updatedSection.totalDuration,
                    [`sections.${oldSectionIndex}.hasCorrection`]: updatedSection.hasCorrection,
                    [`sections.${oldSectionIndex}.isAvailable`]: updatedSection.isAvailable,
                    [`sections.${oldSectionIndex}.correctionIsAvailable`]: updatedSection.correctionIsAvailable,
                    [`sections.${oldSectionIndex}.order`]: updatedSection.order,
                    [`sections.${oldSectionIndex}.contents`]: mergedContents,
                    [`sections.${oldSectionIndex}.examenIsLock`]: updatedSection.examenIsLock,
                }
            }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({error: 'Erreur lors de la mise à jour'}, {status: 500});
        }

        // Récupérer la section mise à jour
        const updatedModule = await db.collection<Module>('modules').findOne({
            _id: new ObjectId(moduleId)
        });

        const finalSection = updatedModule?.sections.find(section => section._id === sectionId);

        return NextResponse.json({success: true, section: finalSection});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
});
