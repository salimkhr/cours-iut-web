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

export async function PUT(
    req: Request,
    context: { params: Promise<{ moduleId: string }> }
) {
    try {
        const {moduleId} = await context.params;
        const {sectionId, ...updatedSection} = await req.json();

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
                    [`sections.${oldSectionIndex}.tags`]: updatedSection.tags,
                    [`sections.${oldSectionIndex}.totalDuration`]: updatedSection.totalDuration,
                    [`sections.${oldSectionIndex}.hasCorrection`]: updatedSection.hasCorrection,
                    [`sections.${oldSectionIndex}.isAvailable`]: updatedSection.isAvailable,
                    [`sections.${oldSectionIndex}.correctionIsAvailable`]: updatedSection.correctionIsAvailable,
                    [`sections.${oldSectionIndex}.order`]: updatedSection.order,
                    [`sections.${oldSectionIndex}.contents`]: updatedSection.contents,
                }
            }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({error: 'Erreur lors de la mise à jour'}, {status: 500});
        }

        const modulePath = await getModules().then(modules => modules.find(mod => mod._id === moduleId)?.path);
        if (modulePath === undefined || modulePath === null || modulePath === '') {
            return NextResponse.json({error: 'Module introuvable'}, {status: 404});
        }

        // Gestion des fichiers de contenu
        if (updatedSection.contents && Array.isArray(updatedSection.contents)) {
            const oldContentDir = path.resolve(
                process.cwd(),
                'src',
                'cours',
                modulePath,
                oldSection.path
            );

            const newContentDir = path.resolve(
                process.cwd(),
                'src',
                'cours',
                modulePath,
                updatedSection.path
            );

            // Si le path a changé, renommer le dossier
            if (oldSection.path !== updatedSection.path) {
                try {
                    await fs.access(oldContentDir);
                    await fs.rename(oldContentDir, newContentDir);
                } catch (error) {
                    console.log(`Dossier ${oldContentDir} introuvable ou erreur de renommage:`, error);
                }
            }

            // Créer/mettre à jour les fichiers de contenu
            for (const content of updatedSection.contents) {
                const contentFilePath = path.join(newContentDir, `${content.charAt(0).toUpperCase() + content.slice(1)}.tsx`);

                const tsxContent = `
import Heading from "@/components/ui/Heading";

export default function ${content.charAt(0).toUpperCase() + content.slice(1)}() {
    return (
        <Heading level={2}>${content}</Heading>
    );
}
`.trim();

                await fs.mkdir(newContentDir, {recursive: true});

                try {
                    await fs.access(contentFilePath);
                    // Fichier existe, on ne l'écrase pas
                    console.log(`Le fichier ${contentFilePath} existe déjà, pas d'écriture.`);
                } catch {
                    // Fichier n'existe pas, on l'écrit
                    await fs.writeFile(contentFilePath, tsxContent, 'utf8');
                }
            }

            // Supprimer les fichiers de contenu qui ne sont plus dans la liste
            if (oldSection.contents && Array.isArray(oldSection.contents)) {
                const removedContents = oldSection.contents.filter(content =>
                    !updatedSection.contents.includes(content)
                );

                for (const removedContent of removedContents) {
                    const fileToRemove = path.join(
                        newContentDir,
                        `${removedContent.charAt(0).toUpperCase() + removedContent.slice(1)}.tsx`
                    );

                    try {
                        await fs.unlink(fileToRemove);
                        console.log(`Fichier supprimé: ${fileToRemove}`);
                    } catch (error) {
                        console.log(`Impossible de supprimer le fichier ${fileToRemove}:`, error);
                    }
                }
            }
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
}