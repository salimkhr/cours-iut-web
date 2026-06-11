import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { connectToDB } from "@/lib/mongodb";
import type { Block, CourseContent } from "@/types/CourseContent";
import { containerRules, blockPropsSchemas } from "@/lib/blockSchemas";
import { validateBlockTree } from "@/lib/validateBlockTree";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

const TOOLS = [
    {
        name: "update_blocks",
        description: "Remplace entièrement l'arbre de blocs du contenu ouvert dans le builder.",
        input_schema: {
            type: "object",
            $defs: {
                block: {
                    type: "object",
                    properties: {
                        id:       { type: "string" },
                        type:     { type: "string" },
                        props:    { type: "object" },
                        children: { type: "array", items: { $ref: "#/$defs/block" } },
                    },
                    required: ["id", "type", "props"],
                },
            },
            properties: {
                blocks: {
                    type: "array",
                    description: "Nouvel arbre complet de blocs",
                    items: { $ref: "#/$defs/block" },
                },
            },
            required: ["blocks"],
        },
    },
];

type AiAssistBody = {
    message: string;
    currentBlocks: Block[];
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
};

type AnthropicContent = {
    type: string;
    text?: string;
    name?: string;
    input?: { blocks: Block[] };
};

export const POST = withAdmin(async (req: Request) => {
    if (!ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: "ANTHROPIC_API_KEY non défini" }, { status: 500 });
    }

    try {
        const body = await req.json() as AiAssistBody;

        const NESTING_DOC = Object.entries(containerRules)
            .map(([type, rule]) => {
                const children = rule.allowedChildren === "any" ? "tout type (sauf columns)" : rule.allowedChildren.join(", ");
                const parents = rule.allowedParents
                    ? rule.allowedParents.map((p) => p ?? "racine").join(", ")
                    : "partout";
                return `- ${type} : enfants = ${children} ; parents = ${parents}`;
            })
            .join("\n");

        const systemPrompt = `Tu es un assistant qui aide à construire du contenu pédagogique.
Tu as accès au tool update_blocks pour modifier l'arbre de blocs du cours ouvert.
Types de blocs disponibles : ${Object.keys(blockPropsSchemas).join(", ")}.
Les conteneurs portent leurs enfants dans "children" :
${NESTING_DOC}
Contraintes : columns a 2 à 4 enfants column dont la somme des props.span fait 12 (valeurs : 3, 4, 6, 8, 9) ; list ne contient que des list-item ; chaque bloc a un id unique (uuid).
Blocs actuels :
${JSON.stringify(body.currentBlocks, null, 2)}`;

        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 4096,
                system: systemPrompt,
                tools: TOOLS,
                messages: [{ role: "user", content: body.message }],
            }),
        });

        if (!anthropicRes.ok) {
            const err = await anthropicRes.text();
            return NextResponse.json({ error: `Anthropic error: ${err}` }, { status: 500 });
        }

        const anthropicData = await anthropicRes.json() as { content: AnthropicContent[] };

        let newBlocks: Block[] | null = null;
        let assistantText = "";

        for (const part of anthropicData.content) {
            if (part.type === "text" && part.text) {
                assistantText = part.text;
            }
            if (part.type === "tool_use" && part.name === "update_blocks" && part.input) {
                const validation = validateBlockTree(part.input.blocks);
                if (!validation.valid) {
                    return NextResponse.json({
                        text: assistantText,
                        blocks: null,
                        error: `Blocs générés invalides : ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(" ; ")}`,
                    }, { status: 422 });
                }
                newBlocks = part.input.blocks;

                const db = await connectToDB();
                const now = new Date();

                const existing = await db
                    .collection<CourseContent>("course_content")
                    .findOne({
                        moduleSlug: body.moduleSlug,
                        sectionSlug: body.sectionSlug,
                        contentType: body.contentType as CourseContent["contentType"],
                    });

                if (existing) {
                    await db.collection<CourseContent>("course_content").updateOne(
                        { _id: existing._id },
                        { $set: { blocks: newBlocks, updatedAt: now }, $inc: { version: 1 } }
                    );
                } else {
                    await db.collection<CourseContent>("course_content").insertOne({
                        moduleSlug: body.moduleSlug,
                        sectionSlug: body.sectionSlug,
                        contentType: body.contentType as "cours" | "TP" | "examen",
                        blocks: newBlocks,
                        version: 1,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
        }

        return NextResponse.json({ text: assistantText, blocks: newBlocks });
    } catch (error) {
        console.error("[ai-assist]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});
