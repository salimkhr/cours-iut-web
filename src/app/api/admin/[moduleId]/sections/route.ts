import {NextResponse} from 'next/server';
import Section from "@/types/Section";
import {connectToDB} from "@/lib/mongodb";
import Module from "@/types/module";
import {ObjectId} from "bson";
import path from 'path';
import fs from 'fs/promises';
import getModules from "@/lib/getModules";

export async function POST(
    req: Request,
    context: { params: Promise<{ moduleId: string }> }
) {
    try {
        const {moduleId} = await context.params;
        const section: Section = await req.json();

        const db = await connectToDB();

        const result = await db.collection<Module>('modules').updateOne(
            {_id: new ObjectId(moduleId)},
            {$push: {sections: section}}
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({error: 'Module introuvable'}, {status: 404});
        }

        const modulePath = await getModules().then(modules => modules.find(mod => mod._id === moduleId)?.path);
        if (modulePath === undefined || modulePath === null || modulePath === '') {
            return NextResponse.json({error: 'Module introuvable'}, {status: 404});
        }

        if (section.contents && Array.isArray(section.contents)) {
            for (const content of section.contents) {
                const currentModulePath = modulePath;
                const currentSectionPath = section.path;
                const currentContent = content;

                const contentDir = path.resolve(
                    process.cwd(),
                    'src',
                    'cours',
                    currentModulePath,
                    currentSectionPath
                );

                const contentFilePath = path.join(contentDir, `${currentContent.charAt(0).toUpperCase() + currentContent.slice(1)}.tsx`);

                const tsxContent = `
import Heading from "@/components/ui/Heading";

export default function ${currentContent.charAt(0).toUpperCase() + currentContent.slice(1)}() {
    return (
        <Heading level={2}>${currentContent}</Heading>
    );
}
`.trim();

                await fs.mkdir(contentDir, {recursive: true});

                try {
                    await fs.access(contentFilePath);
                    // Fichier existe, on ne l’écrase pas
                    console.log(`Le fichier ${contentFilePath} existe déjà, pas d'écriture.`);
                } catch {
                    // Fichier n'existe pas, on l'écrit
                    await fs.writeFile(contentFilePath, tsxContent, 'utf8');
                }
            }
        }

        return NextResponse.json({success: true, section});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Erreur interne'}, {status: 500});
    }
}