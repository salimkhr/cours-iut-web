import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { connectToDB } from "@/lib/mongodb";
import type { Block, CourseContent } from "@/types/CourseContent";
import { getBlockDefinition } from "@/lib/blockRegistry";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

const TOOLS = [
    {
        name: "update_blocks",
        description: "Remplace entièrement la liste de blocs du contenu ouvert dans le builder.",
        input_schema: {
            type: "object",
            properties: {
                blocks: {
                    type: "array",
                    description: "Nouveau tableau complet de blocs",
                    items: {
                        type: "object",
                        properties: {
                            id:      { type: "string" },
                            type:    { type: "string" },
                            props:   { type: "object" },
                            colSpan: { type: "string", enum: ["full", "half"] },
                        },
                        required: ["id", "type", "props"],
                    },
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

        const systemPrompt = `Tu es un assistant qui aide à construire du contenu pédagogique.
Tu as accès au tool update_blocks pour modifier les blocs du cours ouvert.
Types de blocs disponibles : text, heading, list, image-card, table, section-card, named-component.
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
                newBlocks = part.input.blocks;

                const db = await connectToDB();
                const now = new Date();

                for (const block of newBlocks) {
                    const def = getBlockDefinition(block.type);
                    if (def) {
                        def.schema.safeParse(block.props);
                    }
                }

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
