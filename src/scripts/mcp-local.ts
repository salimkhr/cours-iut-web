import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
    assertLocalMongoUri,
    connectToLocalDB,
    getLocalContent,
    getLocalModule,
    getLocalSection,
    listLocalSections,
    replaceLocalModuleSections,
    type LocalSectionInput,
    saveLocalContent,
} from "@/lib/mcp/localDbTools";

const CONTENT_TYPE = z.enum(["cours", "TP", "examen", "slide"]);

const contentRefSchema = z.union([
    z.object({
        type: z.string().min(1),
        source: z.literal("file").optional(),
    }),
    z.object({
        type: z.string().min(1),
        source: z.literal("db"),
        contentId: z.string().min(1),
    }),
]);

const sectionSchema = z.object({
    path: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    order: z.number().int().min(1).optional(),
    contents: z.array(contentRefSchema).optional(),
    objectives: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    totalDuration: z.number().int().min(1).optional(),
    courseIntroMinutes: z.number().int().min(0).optional(),
    brief: z.object({
        objectives: z.array(z.string()).default([]),
        notions: z.array(z.string()).default([]),
        filRougeStep: z.string().default(""),
        notes: z.string().optional(),
    }).optional(),
    curriculum: z.object({
        notions: z.array(z.string()).default([]),
        apis: z.array(z.string()).default([]),
    }).optional(),
    hasCorrection: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    correctionIsAvailable: z.boolean().optional(),
    examenIsLock: z.boolean().optional(),
});

function jsonText(value: unknown) {
    return {
        content: [{
            type: "text" as const,
            text: JSON.stringify(value, null, 2),
        }],
    };
}

export function buildLocalMcpServer(): McpServer {
    const server = new McpServer(
        { name: "cours-iut-local", version: "1.0.0" },
        {
            instructions: [
                "Outils locaux pour cours-iut-web.",
                "Toutes les ecritures sont limitees a la base MongoDB locale cours-iut-web.",
                "Le serveur refuse de demarrer si MONGODB_URI ne cible pas localhost, 127.0.0.1 ou ::1.",
                "Utiliser dryRun=true avant les operations de remplacement importantes.",
            ].join(" "),
        }
    );

    server.tool(
        "local_target",
        "Affiche la cible Mongo locale autorisee, sans exposer l'URI complete.",
        {},
        async () => jsonText(assertLocalMongoUri(process.env.MONGODB_URI))
    );

    server.tool(
        "get_module",
        "Retourne les metadonnees d'un module local, sans sections imbriquees ni _id brut.",
        {
            module: z.string().describe("Slug du module, ex: html-css"),
        },
        async ({ module }) => {
            const db = await connectToLocalDB();
            return jsonText(await getLocalModule(db, module));
        }
    );

    server.tool(
        "list_sections",
        "Retourne les metadonnees des sections d'un module local, triees par ordre.",
        {
            module: z.string().describe("Slug du module, ex: html-css"),
        },
        async ({ module }) => {
            const db = await connectToLocalDB();
            return jsonText(await listLocalSections(db, module));
        }
    );

    server.tool(
        "get_section",
        "Retourne les metadonnees completes d'une section locale, sans blocs de contenu.",
        {
            module: z.string().describe("Slug du module, ex: html-css"),
            section: z.string().describe("Slug de la section, ex: 1-rappel-de-html"),
        },
        async ({ module, section }) => {
            const db = await connectToLocalDB();
            return jsonText(await getLocalSection(db, module, section));
        }
    );

    server.tool(
        "get_content",
        "Retourne les blocs d'un contenu local en DB.",
        {
            module: z.string(),
            section: z.string(),
            type: CONTENT_TYPE,
        },
        async ({ module, section, type }) => {
            const db = await connectToLocalDB();
            return jsonText(await getLocalContent(db, {
                moduleSlug: module,
                sectionSlug: section,
                contentType: type,
            }));
        }
    );

    server.tool(
        "save_content",
        "Sauvegarde localement l'arbre complet de blocs d'un contenu. dryRun=true valide sans ecrire.",
        {
            module: z.string(),
            section: z.string(),
            type: CONTENT_TYPE,
            blocks: z.array(z.unknown()).describe("Arbre complet de blocs."),
            dryRun: z.boolean().optional().describe("Valide et affiche l'operation sans ecriture."),
        },
        async ({ module, section, type, blocks, dryRun }) => {
            const db = await connectToLocalDB();
            return jsonText(await saveLocalContent(db, {
                moduleSlug: module,
                sectionSlug: section,
                contentType: type,
            }, blocks, { dryRun }));
        }
    );

    server.tool(
        "replace_module_sections",
        "Remplace toutes les sections d'un module local. force=true est requis si le module contient deja des sections.",
        {
            module: z.string(),
            sections: z.array(sectionSchema).describe("Nouveau tableau modules.sections[]."),
            dryRun: z.boolean().optional().describe("Affiche le resultat attendu sans ecriture."),
            force: z.boolean().optional().describe("Autorise le remplacement d'un tableau de sections existant."),
        },
        async ({ module, sections, dryRun, force }) => {
            const db = await connectToLocalDB();
            return jsonText(await replaceLocalModuleSections(
                db,
                module,
                sections as LocalSectionInput[],
                { dryRun, force }
            ));
        }
    );

    return server;
}

async function main(): Promise<void> {
    assertLocalMongoUri(process.env.MONGODB_URI);

    const server = buildLocalMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("cours-iut-local MCP running on stdio");
}

if (import.meta.main) {
    main().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`cours-iut-local MCP error: ${message}`);
        process.exit(1);
    });
}
